import { randomUUID } from 'crypto';
import logger from '../utilities/logger.js';

/**
 * Middleware to add request context (ID, timing, etc.)
 * Essential for request tracing and debugging.
 */
export function requestContext(req, res, next) {
  // Generate unique request ID
  req.requestId = req.headers['x-request-id'] || randomUUID();
  req.startTime = Date.now();

  // Add request ID to response headers
  res.set('X-Request-ID', req.requestId);

  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.socket.remoteAddress,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info('Request completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
}
