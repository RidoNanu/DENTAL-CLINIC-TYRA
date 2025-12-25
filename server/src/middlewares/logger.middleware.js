/**
 * Request Logger Middleware
 * 
 * Logs HTTP requests and responses with timing information.
 * Excludes sensitive data from logs.
 */

/**
 * List of header keys that contain sensitive information
 * These will be redacted from logs
 */
const SENSITIVE_HEADERS = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
];

/**
 * List of body fields that contain sensitive information
 * These will be redacted from logs
 */
const SENSITIVE_BODY_FIELDS = [
    'password',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
];

/**
 * Redact sensitive data from an object
 * @param {Object} obj - Object to redact
 * @returns {Object} Redacted object
 */
const redactSensitiveData = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const redacted = { ...obj };

    SENSITIVE_BODY_FIELDS.forEach((field) => {
        if (redacted[field] !== undefined) {
            redacted[field] = '[REDACTED]';
        }
    });

    return redacted;
};

/**
 * Redact sensitive headers
 * @param {Object} headers - Headers object
 * @returns {Object} Redacted headers
 */
const redactHeaders = (headers) => {
    if (!headers) return {};

    const redacted = { ...headers };

    SENSITIVE_HEADERS.forEach((header) => {
        if (redacted[header] !== undefined) {
            redacted[header] = '[REDACTED]';
        }
    });

    return redacted;
};

/**
 * Format log message for request/response
 * @param {Object} data - Log data
 * @returns {string} Formatted log message
 */
const formatLog = (data) => {
    const { method, url, status, duration, error } = data;

    if (error) {
        return `[ERROR] ${method} ${url} - ${status} - ${duration}ms - ${error}`;
    }

    return `${method} ${url} - ${status} - ${duration}ms`;
};

/**
 * Request logger middleware
 * Logs incoming requests and outgoing responses
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const { method, originalUrl, url } = req;

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
        // Reduced verbosity for production readiness
        // console.log(`[REQUEST] ${method} ${originalUrl || url}`);
    }

    // Capture the original res.json to intercept response
    const originalJson = res.json.bind(res);

    res.json = function (data) {
        const duration = Date.now() - startTime;
        const status = res.statusCode;

        // Log response
        const logData = {
            method,
            url: originalUrl || url,
            status,
            duration,
        };

        // Use different log levels based on status
        if (status >= 500) {
            console.error(`[ERROR] ${formatLog(logData)}`);
        } else if (status >= 400) {
            console.warn(`[WARN] ${formatLog(logData)}`);
        } else {
            console.log(`[SUCCESS] ${formatLog(logData)}`);
        }

        // Log response body in development
        if (process.env.NODE_ENV === 'development' && data) {
            // console.log('  Response:', data.success ? '✓' : '✗', data.message || '');
        }

        return originalJson(data);
    };

    next();
};

/**
 * Error logger middleware
 * Should be placed after error handler to log errors
 */
const errorLogger = (err, req, res, next) => {
    const { method, originalUrl, url } = req;
    const status = err.statusCode || 500;

    // Always log errors
    const logData = {
        method,
        url: originalUrl || url,
        status,
        duration: 0, // Not tracked for errors
        error: err.message,
    };

    console.error(`[ERROR] ${formatLog(logData)}`);

    // Log error stack in development
    if (process.env.NODE_ENV === 'development' && err.stack) {
        // console.error('  Stack:', err.stack);
    }

    // Pass to error handler
    next(err);
};

module.exports = {
    requestLogger,
    errorLogger,
};
