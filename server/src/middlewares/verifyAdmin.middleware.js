/**
 * Verify Admin Middleware
 * 
 * Protects admin routes by verifying JWT tokens.
 * Attaches admin data to req.user if valid.
 */

const authService = require('../services/auth.service');

/**
 * Middleware to verify admin JWT token
 * Extracts token from Authorization header, verifies it, and attaches admin to req.user
 */
const verifyAdmin = (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = authService.verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.'
            });
        }

        // Attach admin data to request
        req.user = {
            admin_id: decoded.admin_id,
            email: decoded.email
        };

        next();
    } catch (error) {
        console.error('[AUTH] Token verification error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = verifyAdmin;
