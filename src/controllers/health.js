import { workerPool } from '../utilities/tesseract/workerPool.js';
import metrics from '../utilities/metrics.js';
import logger from '../utilities/logger.js';

/**
 * Health check endpoint.
 * Returns service health status and basic diagnostics.
 */
export async function healthCheck(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    checks: {},
  };

  // Check worker pool
  try {
    const poolMetrics = workerPool.getMetrics();
    health.checks.workerPool = {
      status: poolMetrics.availableWorkers > 0 ? 'healthy' : 'degraded',
      availableWorkers: poolMetrics.availableWorkers,
      totalWorkers: poolMetrics.poolSize,
    };
  } catch (error) {
    health.checks.workerPool = {
      status: 'unhealthy',
      error: error.message,
    };
    health.status = 'degraded';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const heapPercentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

  health.checks.memory = {
    status: heapPercentage < 90 ? 'healthy' : 'warning',
    heapUsedMB,
    heapTotalMB,
    heapPercentage,
  };

  if (heapPercentage >= 90) {
    health.status = 'degraded';
  }

  // Overall status
  const unhealthyChecks = Object.values(health.checks).filter(c => c.status === 'unhealthy');
  if (unhealthyChecks.length > 0) {
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
}

/**
 * Metrics endpoint.
 * Returns detailed application metrics for monitoring.
 */
export async function getMetrics(req, res) {
  const appMetrics = metrics.getMetrics();
  const workerPoolMetrics = workerPool.getMetrics();

  const response = {
    timestamp: new Date().toISOString(),
    application: appMetrics,
    workerPool: workerPoolMetrics,
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    },
  };

  logger.debug('Metrics requested', { requestId: req.requestId });

  res.json(response);
}
