/**
 * Admin-Only Middleware
 * 
 * Requires both authentication AND admin role.
 * Combines auth check + role check in a single middleware.
 * 
 * Usage:
 *   router.post('/admin-route', adminOnly, controller.handler);
 */

const supabase = require('../lib/supabaseClient');
const ApiError = require('../utils/apiError');

/**
 * Admin-only middleware
 * Verifies JWT token and checks for admin role
 * Rejects non-admin users with 403
 */
const adminOnly = async (req, res, next) => {
    try {
        // 1. Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // 2. Verify token using Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw ApiError.unauthorized('Invalid or expired token');
        }

        // 3. Check if user has admin role
        const userRole = user.user_metadata?.role;

        if (userRole !== 'admin') {
            throw ApiError.forbidden('Admin access required');
        }

        // 4. Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: userRole,
            metadata: user.user_metadata,
        };

        next();
    } catch (error) {
        // Pass ApiError through, wrap others
        if (error.name === 'ApiError') {
            next(error);
        } else {
            console.error('Admin auth error:', error);
            next(ApiError.unauthorized('Authentication failed'));
        }
    }
};

module.exports = { adminOnly };
