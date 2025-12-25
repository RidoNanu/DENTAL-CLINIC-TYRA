/**
 * Admin Management Routes
 * 
 * Routes for managing admin users.
 * All routes protected by verifyAdmin middleware (mounted at /admin level)
 */

const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const clinicSettingsController = require('../../controllers/clinicSettings.controller');

/**
 * @route   GET /api/v1/admin/clinic-settings
 * @desc    Get clinic working hours
 * @access  Protected (Admin only)
 */
router.get('/clinic-settings', clinicSettingsController.getSettings);

/**
 * @route   PUT /api/v1/admin/clinic-settings
 * @desc    Update clinic working hours
 * @access  Protected (Admin only)
 */
router.put('/clinic-settings', clinicSettingsController.updateSettings);

/**
 * @route   GET /api/v1/admin/admins
 * @desc    Get all admin users
 * @access  Protected (Admin only)
 */
router.get('/', adminController.getAllAdmins);

/**
 * @route   POST /api/v1/admin/admins
 * @desc    Create new admin user
 * @access  Protected (Admin only)
 */
router.post('/', adminController.createAdmin);

/**
 * @route   DELETE /api/v1/admin/admins/:id
 * @desc    Delete admin user
 * @access  Protected (Admin only)
 */
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;
