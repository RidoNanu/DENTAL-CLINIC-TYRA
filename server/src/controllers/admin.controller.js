/**
 * Admin Management Controller
 * 
 * Handles admin user management operations.
 * Protected endpoints - requires JWT authentication.
 */

const authService = require('../services/auth.service');
const supabase = require('../lib/supabaseClient');

/**
 * Create new admin account
 * POST /api/v1/admin/admins
 * 
 * Request body: { email, password }
 * Returns: { success, admin }
 */
const createAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if admin already exists
        const existingAdmin = await authService.findAdminByEmail(email);
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: 'An admin with this email already exists'
            });
        }

        // Hash password
        const passwordHash = await authService.hashPassword(password);

        // Create admin in database
        const { data, error } = await supabase
            .from('admins')
            .insert({
                email: email.toLowerCase(),
                password_hash: passwordHash
            })
            .select('id, email, created_at')
            .single();

        if (error) {
            console.error('[ADMIN] Error creating admin:', error);
            throw new Error('Failed to create admin account');
        }

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            admin: data
        });
    } catch (error) {
        console.error('[ADMIN] Create admin error:', error.message);
        next(error);
    }
};

/**
 * Get all admins
 * GET /api/v1/admin/admins
 * 
 * Returns: { success, admins }
 */
const getAllAdmins = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('admins')
            .select('id, email, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error('Failed to fetch admins');
        }

        res.json({
            success: true,
            admins: data
        });
    } catch (error) {
        console.error('[ADMIN] Get admins error:', error.message);
        next(error);
    }
};

/**
 * Delete admin account
 * DELETE /api/v1/admin/admins/:id
 * 
 * Returns: { success, message }
 */
const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (id === req.user.admin_id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own admin account'
            });
        }

        const { error } = await supabase
            .from('admins')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error('Failed to delete admin');
        }

        res.json({
            success: true,
            message: 'Admin account deleted successfully'
        });
    } catch (error) {
        console.error('[ADMIN] Delete admin error:', error.message);
        next(error);
    }
};

module.exports = {
    createAdmin,
    getAllAdmins,
    deleteAdmin
};
