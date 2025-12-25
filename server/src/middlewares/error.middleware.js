/**
 * Centralized Error Handling Middleware
 * 
 * Catches all errors and sends consistent JSON responses.
 * Services throw ApiError, controllers call next(error).
 * This middleware formats and sends the response.
 */

const ApiError = require('../utils/apiError');

/**
 * Global error handler
 * MUST be the last middleware in app.js
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';

    // Handle ApiError (thrown by services)
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle Supabase/PostgreSQL errors
    else if (err.code) {
        // Convert Supabase error codes to user-friendly messages
        switch (err.code) {
            case '23505': // Unique constraint violation
                statusCode = 409;
                message = 'A record with this information already exists';
                break;
            case '23503': // Foreign key violation
                statusCode = 400;
                message = 'Invalid reference to related record';
                break;
            case '22P02': // Invalid text representation
                statusCode = 400;
                message = 'Invalid data format';
                break;
            case 'PGRST116': // Not found
                statusCode = 404;
                message = 'Resource not found';
                break;
            default:
                message = 'Database operation failed';
        }
    }
    // Handle validation errors (if using express-validator)
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Generic error handling
    else if (err.message) {
        message = err.message;
    }

    // Log error for debugging (not to client)
    if (process.env.NODE_ENV === 'development') {
        console.error('[ERROR]:', {
            statusCode,
            message,
            stack: err.stack,
            originalError: err,
        });
    }

    // Send consistent error response
    res.status(statusCode).json({
        success: false,
        message,
    });
};

/**
 * Not Found middleware (for undefined routes)
 */
const notFound = (req, res, next) => {
    next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

module.exports = {
    errorHandler,
    notFound,
};
