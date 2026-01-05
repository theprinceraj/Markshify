import express from "express";
import dotenv from "dotenv";
import logger from "../src/utilities/logger.js";
import { errorHandler, notFoundHandler } from "../src/middleware/errorHandler.js";
import { requestContext } from "../src/middleware/requestContext.js";
import { apiRateLimiter } from "../src/middleware/rateLimiter.js";
import { workerPool } from "../src/utilities/tesseract/workerPool.js";
import { scan } from "../src/controllers/scanner.js";
import { scanBatch } from "../src/controllers/batchScanner.js";
import { generate } from "../src/controllers/generator.js";
import { healthCheck, getMetrics } from "../src/controllers/health.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy for proper IP detection behind load balancers
app.set("trust proxy", 1);
app.use(express.static("public"));
app.use(express.json({ limit: "15mb" }));
app.use(requestContext);
app.use("/api", apiRateLimiter);

// API Routes
app.post("/api/scan", scan);
app.post("/api/scan/batch", scanBatch);
app.get("/api/generate", generate);

// Health and metrics endpoints
app.get("/api/health", healthCheck);
app.get("/api/metrics", getMetrics);

// Legacy route for backward compatibility
app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "Markshify API is running",
        version: "2.0.0",
        endpoints: {
            scan: "POST /api/scan",
            scanBatch: "POST /api/scan/batch",
            generate: "GET /api/generate",
            health: "GET /api/health",
            metrics: "GET /api/metrics",
        },
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

let server;
const gracefulShutdown = async (signal) => {
    logger.info("Graceful shutdown initiated", { signal });

    // Stop accepting new requests
    server.close(async () => {
        logger.info("HTTP server closed");

        // Shutdown worker pool
        try {
            await workerPool.shutdown();
        } catch (error) {
            logger.error("Error shutting down worker pool", { error });
        }

        logger.info("Shutdown complete");
        process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", { error });
    gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled rejection", { reason, promise: String(promise) });
});

server = app.listen(port, async () => {
    logger.info("Server started", {
        port,
        nodeEnv: process.env.NODE_ENV || "development",
        version: "2.0.0",
    });
    try {
        await workerPool.initialize();
    } catch (error) {
        logger.error("Failed to initialize worker pool", { error });
    }

    console.log(`🚀 Markshify API running on port ${port}`);
    console.log("   Made by Team Dhruv ✨");
});

export default app;
