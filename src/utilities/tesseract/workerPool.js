import { createWorker } from "tesseract.js";
import logger from "../logger.js";
import { configDotenv } from "dotenv";
configDotenv();

/**
 * Tesseract Worker Pool for efficient OCR processing.
 * Manages a pool of pre-initialized workers to reduce latency.
 */
class TesseractWorkerPool {
    constructor(poolSize = 2) {
        this.poolSize = poolSize;
        this.workers = [];
        this.available = [];
        this.waiting = [];
        this.initialized = false;
        this.initPromise = null;
        this.metrics = {
            totalProcessed: 0,
            totalErrors: 0,
            avgProcessingTime: 0,
            processingTimes: [],
        };
    }

    /**
     * Initializes the worker pool with pre-configured workers.
     */
    async initialize() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._initializeWorkers();
        return this.initPromise;
    }

    async _initializeWorkers() {
        if (this.initialized) return;

        logger.info("Initializing Tesseract worker pool", { poolSize: this.poolSize });

        const workerPromises = [];
        for (let i = 0; i < this.poolSize; i++) {
            workerPromises.push(this._createWorker(i));
        }

        this.workers = await Promise.all(workerPromises);
        this.available = [...this.workers];
        this.initialized = true;

        logger.info("Tesseract worker pool initialized", {
            activeWorkers: this.workers.length,
        });
    }

    async _createWorker(id) {
        const worker = await createWorker();
        await worker.setParameters({
            tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:. ",
        });

        logger.debug("Created Tesseract worker", { workerId: id });
        return { id, worker, busy: false };
    }

    /**
     * Acquires a worker from the pool.
     * If no workers are available, waits for one to become available.
     * @returns {Promise<Object>} Worker object
     */
    async acquire() {
        await this.initialize();

        if (this.available.length > 0) {
            const workerObj = this.available.pop();
            workerObj.busy = true;
            return workerObj;
        }

        // Wait for a worker to become available
        return new Promise((resolve) => {
            this.waiting.push(resolve);
        });
    }

    /**
     * Releases a worker back to the pool.
     * @param {Object} workerObj - Worker object to release
     */
    release(workerObj) {
        workerObj.busy = false;

        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift();
            workerObj.busy = true;
            resolve(workerObj);
        } else {
            this.available.push(workerObj);
        }
    }

    /**
     * Performs OCR recognition on an image with the given rectangles.
     * @param {Buffer} image - Image buffer to process
     * @param {Array} rectangles - Array of rectangle objects for region extraction
     * @returns {Promise<Array>} Array of extracted text with confidence scores
     */
    async recognize(image, rectangles) {
        const workerObj = await this.acquire();
        const startTime = Date.now();

        try {
            const results = [];

            for (const rectangle of rectangles) {
                const { data } = await workerObj.worker.recognize(image, {
                    rectangle,
                });

                results.push({
                    text: data.text.trim(),
                    confidence: data.confidence,
                });
            }

            // Update metrics
            const processingTime = Date.now() - startTime;
            this.updateMetrics(processingTime);

            logger.debug("OCR recognition completed", {
                workerId: workerObj.id,
                rectangleCount: rectangles.length,
                processingTimeMs: processingTime,
                avgConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
            });

            return results;
        } catch (error) {
            this.metrics.totalErrors++;
            logger.error("OCR recognition failed", {
                workerId: workerObj.id,
                error,
            });
            throw error;
        } finally {
            this.release(workerObj);
        }
    }

    /**
     * Updates processing metrics.
     * @param {number} processingTime - Time taken for processing
     */
    updateMetrics(processingTime) {
        this.metrics.totalProcessed++;
        this.metrics.processingTimes.push(processingTime);

        // Keep only last 100 processing times for rolling average
        if (this.metrics.processingTimes.length > 100) {
            this.metrics.processingTimes.shift();
        }

        this.metrics.avgProcessingTime =
            this.metrics.processingTimes.reduce((a, b) => a + b, 0) / this.metrics.processingTimes.length;
    }

    /**
     * Gets current pool metrics.
     * @returns {Object} Pool metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            poolSize: this.poolSize,
            availableWorkers: this.available.length,
            waitingRequests: this.waiting.length,
        };
    }

    /**
     * Gracefully shuts down all workers in the pool.
     */
    async shutdown() {
        logger.info("Shutting down Tesseract worker pool");

        for (const workerObj of this.workers) {
            try {
                await workerObj.worker.terminate();
                logger.debug("Terminated Tesseract worker", { workerId: workerObj.id });
            } catch (error) {
                logger.error("Error terminating worker", { workerId: workerObj.id, error });
            }
        }

        this.workers = [];
        this.available = [];
        this.initialized = false;
        this.initPromise = null;

        logger.info("Tesseract worker pool shut down complete");
    }
}

// Singleton instance
const poolSize = parseInt(process.env.TESSERACT_POOL_SIZE) || 2;
export const workerPool = new TesseractWorkerPool(poolSize);

export default workerPool;
