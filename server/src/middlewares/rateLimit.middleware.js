/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse by limiting requests per IP address.
 */

const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Applies to all authenticated /api/v1 routes
 * 
 * Limits: 100 requests per 15 minutes per IP
 * 
 * NOTE: Admin authenticated routes bypass this limit as they're
 * already protected by JWT authentication.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});

/**
 * Strict Rate Limiter for Authentication Endpoints
 * Protects against brute force login attacks
 * 
 * Limits: 5 requests per 15 minutes per IP
 * 
 * Apply to: /login, /signup, /reset-password endpoints
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 login attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    skipFailedRequests: false,
});

/**
 * Strict Rate Limiter for Public Appointment Booking
 * Prevents spam bookings while allowing legitimate users
 * 
 * Limits: 5 requests per 10 minutes per IP
 * 
 * Apply to: POST /api/v1/public/appointments
 */
const bookingLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // 5 appointment requests per 10 minutes
    message: {
        success: false,
        message: 'Too many booking attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    bookingLimiter,
};
