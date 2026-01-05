/**
 * Structured logging utility for production-grade observability.
 * Provides consistent log formatting with levels, timestamps, and context.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

/**
 * Formats a log entry with timestamp, level, and structured data.
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param {string} message - Main log message
 * @param {Object} context - Additional context data
 * @returns {string} Formatted log string
 */
function formatLog(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  };
  return JSON.stringify(logEntry);
}

/**
 * Logger instance with level-aware logging methods.
 */
export const logger = {
  debug(message, context = {}) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug(formatLog('DEBUG', message, context));
    }
  },

  info(message, context = {}) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
      console.info(formatLog('INFO', message, context));
    }
  },

  warn(message, context = {}) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(formatLog('WARN', message, context));
    }
  },

  error(message, context = {}) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      // Extract error details if an Error object is passed
      if (context.error instanceof Error) {
        context.errorMessage = context.error.message;
        context.errorStack = context.error.stack;
        delete context.error;
      }
      console.error(formatLog('ERROR', message, context));
    }
  },

  /**
   * Creates a child logger with preset context fields.
   * @param {Object} defaultContext - Default context to include in all logs
   * @returns {Object} Child logger instance
   */
  child(defaultContext) {
    return {
      debug: (msg, ctx = {}) => logger.debug(msg, { ...defaultContext, ...ctx }),
      info: (msg, ctx = {}) => logger.info(msg, { ...defaultContext, ...ctx }),
      warn: (msg, ctx = {}) => logger.warn(msg, { ...defaultContext, ...ctx }),
      error: (msg, ctx = {}) => logger.error(msg, { ...defaultContext, ...ctx }),
    };
  },
};

export default logger;
