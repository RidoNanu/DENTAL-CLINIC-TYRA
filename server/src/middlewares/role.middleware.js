/**
 * Role-Based Access Control Middleware
 * 
 * Enforces role-based permissions.
 * Requires authentication middleware to run first.
 */

const ApiError = require('../utils/apiError');

/**
 * Require admin role
 * User must be authenticated with role = 'admin'
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
    }

    if (req.user.role !== 'admin') {
        return next(ApiError.forbidden('Admin access required'));
    }

    next();
};

/**
 * Require authenticated user (any role)
 * User must be authenticated
 */
const requireUser = (req, res, next) => {
    if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
    }

    next();
};

/**
 * Require resource owner or admin
 * User must own the resource or be an admin
 * 
 * @param {string} resourceIdParam - Name of route param containing resource ID (default: 'id')
 * @param {string} ownerField - Name of field in req.user containing owner ID (default: 'id')
 */
const requireOwnerOrAdmin = (resourceIdParam = 'id', ownerField = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        // Admin always has access
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user owns the resource
        const resourceId = req.params[resourceIdParam];
        const ownerId = req.user[ownerField];

        if (resourceId !== ownerId) {
            return next(ApiError.forbidden('Access denied'));
        }

        next();
    };
};

/**
 * Allow admin or read-only for users
 * Admin: full access
 * User: only GET requests
 */
const adminOrReadOnly = (req, res, next) => {
    if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
    }

    // Admin has full access
    if (req.user.role === 'admin') {
        return next();
    }

    // Users can only use GET methods
    if (req.method !== 'GET') {
        return next(ApiError.forbidden('Read-only access'));
    }

    next();
};

module.exports = {
    requireAdmin,
    requireUser,
    requireOwnerOrAdmin,
    adminOrReadOnly,
};
