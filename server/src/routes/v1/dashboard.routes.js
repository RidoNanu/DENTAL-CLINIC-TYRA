/**
 * Dashboard Routes
 * 
 * Routes for admin dashboard statistics
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboard.controller');

// All dashboard routes protected by verifyAdmin middleware at mount level


/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get dashboard statistics (appointments, patients, revenue)
 * @access  Private (Admin only)
 */
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
