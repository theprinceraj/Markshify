import logger from '../utilities/logger.js';

/**
 * In-memory rate limiting implementation.
 */

// Store for tracking request counts
const requestCounts = new Map();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.windowStart > data.windowMs * 2) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Cleanup every minute

/**
 * Creates a rate limiter middleware.
 * @param {Object} options - Rate limiter configuration
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.message - Error message when limit exceeded
 * @returns {Function} Express middleware function
 */
export function rateLimiter({
  windowMs = 60000, // 1 minute default
  maxRequests = 30, // 30 requests per minute default
  message = 'Too many requests, please try again later.',
} = {}) {
  return (req, res, next) => {
    // Use IP address as key (consider X-Forwarded-For in production behind proxy)
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${clientIp}:${req.path}`;
    const now = Date.now();

    let clientData = requestCounts.get(key);

    if (!clientData || now - clientData.windowStart > windowMs) {
      // Start new window
      clientData = {
        count: 1,
        windowStart: now,
        windowMs,
      };
      requestCounts.set(key, clientData);
    } else {
      clientData.count++;
    }

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, maxRequests - clientData.count);
    const resetTime = new Date(clientData.windowStart + windowMs);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': resetTime.toISOString(),
    });

    if (clientData.count > maxRequests) {
      logger.warn('Rate limit exceeded', {
        clientIp,
        path: req.path,
        count: clientData.count,
        limit: maxRequests,
        requestId: req.requestId,
      });

      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: Math.ceil((clientData.windowStart + windowMs - now) / 1000),
        },
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}

/**
 * Stricter rate limiter for resource-intensive endpoints.
 */
export const scanRateLimiter = rateLimiter({
  windowMs: 60000,
  maxRequests: 10,
  message: 'Scan rate limit exceeded. Please wait before scanning more documents.',
});

/**
 * General API rate limiter.
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 60000,
  maxRequests: 60,
  message: 'API rate limit exceeded.',
});
