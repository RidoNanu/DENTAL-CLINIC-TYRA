/**
 * Settings Routes
 * 
 * API endpoints for clinic settings and system configuration
 * All routes protected by verifyAdmin middleware
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/settings.controller');

/**
 * @route   GET /api/v1/settings/clinic
 * @desc    Get clinic settings
 * @access  Protected (Admin only)
 */
router.get('/clinic', settingsController.getClinicSettings);

/**
 * @route   PUT /api/v1/settings/clinic
 * @desc    Update clinic settings
 * @access  Protected (Admin only)
 */
router.put('/clinic', settingsController.updateClinicSettings);

/**
 * @route   GET /api/v1/settings/notifications
 * @desc    Get notification preferences
 * @access  Protected (Admin only)
 */
router.get('/notifications', settingsController.getNotificationSettings);

/**
 * @route   PUT /api/v1/settings/notifications
 * @desc    Update notification preferences
 * @access  Protected (Admin only)
 */
router.put('/notifications', settingsController.updateNotificationSettings);

/**
 * @route   GET /api/v1/settings/system-info
 * @desc    Get system information
 * @access  Protected (Admin only)
 */
router.get('/system-info', settingsController.getSystemInfo);

module.exports = router;
