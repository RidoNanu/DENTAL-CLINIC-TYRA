/**
 * Authentication Middleware
 * 
 * Verifies Supabase JWT tokens and attaches user to request.
 * 
 * ADMIN-ONLY SYSTEM:
 * Any authenticated Supabase user is considered an admin.
 * No role checking required.
 */

const supabase = require('../lib/supabaseClient');
const ApiError = require('../utils/apiError');

/**
 * Authenticate user via JWT token
 * Reads Authorization: Bearer <token> header
 * Verifies token using Supabase
 * Attaches user to req.user
 * 
 * Any valid JWT = admin access
 */
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token using Supabase with timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Supabase auth timeout')), 5000)
        );

        const authPromise = supabase.auth.getUser(token);

        const { data: { user }, error } = await Promise.race([
            authPromise,
            timeoutPromise
        ]);

        if (error || !user) {
            throw ApiError.unauthorized('Invalid or expired token');
        }

        // Attach user to request for use in controllers
        // Any authenticated user is an admin
        req.user = {
            id: user.id,
            email: user.email,
            metadata: user.user_metadata,
        };

        next();
    } catch (error) {
        console.error('[AUTH] Error caught:', error.message);

        // If it's already an ApiError, pass it through
        if (error.name === 'ApiError') {
            next(error);
        } else {
            // Wrap other errors
            next(ApiError.unauthorized('Authentication failed'));
        }
    }
};

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without user
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            // Invalid token, continue without user
            req.user = null;
            return next();
        }

        // Attach user if valid
        req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user',
            metadata: user.user_metadata,
        };

        next();
    } catch (error) {
        // On any error, just continue without user
        req.user = null;
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth,
};
