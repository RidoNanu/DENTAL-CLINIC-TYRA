/**
 * Authentication Controller
 * 
 * Handles admin login endpoint.
 */

const authService = require('../services/auth.service');

/**
 * Admin Login
 * POST /api/v1/auth/login
 * 
 * Request body: { email, password }
 * Returns: { success, token, admin } or 401
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Attempt authentication
        const result = await authService.login(email, password);

        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message
            });
        }

        // Return JWT token
        res.json({
            success: true,
            token: result.token,
            admin: result.admin
        });
    } catch (error) {
        console.error('[AUTH ERROR] Login failed:', error.message);
        next(error);
    }
};

/**
 * Change admin password
 * POST /api/v1/auth/change-password
 * Protected endpoint - requires valid JWT
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.user.admin_id; // From verifyAdmin middleware

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get admin
        const admin = await authService.getAdminById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Verify current password
        const isValid = await authService.verifyPassword(currentPassword, admin.password_hash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await authService.hashPassword(newPassword);

        // Update password
        const updated = await authService.updateAdminPassword(adminId, hashedPassword);
        if (!updated) {
            throw new Error('Failed to update password');
        }

        res.json({
            success: true,
            message: 'Password changed successfully. Please log in again with your new password.'
        });

    } catch (error) {
        console.error('[AUTH ERROR] Change password failed:', error.message);
        next(error);
    }
};

module.exports = {
    login,
    changePassword
};
