import logger from "./logger.js";

/**
 * Application metrics collector for monitoring and analytics.
 * Tracks processing statistics, performance metrics, and system health.
 */
class MetricsCollector {
    constructor() {
        this.startTime = Date.now();
        this.counters = {
            scanRequests: 0,
            successfulScans: 0,
            failedScans: 0,
            generateRequests: 0,
            batchRequests: 0,
            duplicatesSkipped: 0,
            recordsUploaded: 0,
        };
        this.histograms = {
            scanDuration: [],
            ocrConfidence: [],
            imageSizes: [],
        };
        this.gauges = {
            activeRequests: 0,
        };
    }

    /**
     * Increments a counter metric.
     * @param {string} name - Counter name
     * @param {number} value - Value to increment by (default: 1)
     */
    increment(name, value = 1) {
        if (this.counters[name] !== undefined) {
            this.counters[name] += value;
        }
    }

    /**
     * Records a histogram value.
     * @param {string} name - Histogram name
     * @param {number} value - Value to record
     */
    observe(name, value) {
        if (this.histograms[name]) {
            this.histograms[name].push(value);
            // Keep only last 1000 values
            if (this.histograms[name].length > 1000) {
                this.histograms[name].shift();
            }
        }
    }

    /**
     * Sets a gauge value.
     * @param {string} name - Gauge name
     * @param {number} value - Value to set
     */
    set(name, value) {
        if (this.gauges[name] !== undefined) {
            this.gauges[name] = value;
        }
    }

    /**
     * Calculates histogram statistics.
     * @param {Array} values - Array of values
     * @returns {Object} Statistics object
     */
    calculateStats(values) {
        if (values.length === 0) {
            return { min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0, count: 0 };
        }

        const sorted = [...values].sort((a, b) => a - b);
        const sum = sorted.reduce((a, b) => a + b, 0);

        return {
            min: sorted[0],
            max: sorted[sorted.length - 1],
            avg: Math.round((sum / sorted.length) * 100) / 100,
            p50: sorted[Math.floor(sorted.length * 0.5)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
            count: sorted.length,
        };
    }

    /**
     * Gets all metrics in a structured format.
     * @returns {Object} Metrics object
     */
    getMetrics() {
        const uptime = Date.now() - this.startTime;

        return {
            uptime: {
                ms: uptime,
                formatted: this.formatUptime(uptime),
            },
            counters: { ...this.counters },
            histograms: {
                scanDuration: this.calculateStats(this.histograms.scanDuration),
                ocrConfidence: this.calculateStats(this.histograms.ocrConfidence),
                imageSizes: this.calculateStats(this.histograms.imageSizes),
            },
            gauges: { ...this.gauges },
            rates: {
                successRate:
                    this.counters.scanRequests > 0
                        ? Math.round((this.counters.successfulScans / this.counters.scanRequests) * 100 * 100) / 100
                        : 100,
                scansPerMinute: Math.round((this.counters.scanRequests / (uptime / 60000)) * 100) / 100,
            },
        };
    }

    /**
     * Formats uptime into human-readable string.
     * @param {number} ms - Uptime in milliseconds
     * @returns {string} Formatted uptime
     */
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * Resets all metrics.
     */
    reset() {
        Object.keys(this.counters).forEach((key) => (this.counters[key] = 0));
        Object.keys(this.histograms).forEach((key) => (this.histograms[key] = []));
        Object.keys(this.gauges).forEach((key) => (this.gauges[key] = 0));
        this.startTime = Date.now();
        logger.info("Metrics reset");
    }
}

// Singleton instance
export const metrics = new MetricsCollector();

export default metrics;
