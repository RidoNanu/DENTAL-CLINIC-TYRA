/**
 * Schedule Exception Routes
 * 
 * Routes for managing date-specific schedule overrides.
 * Mounted at /api/v1/admin/schedule-exceptions
 * Protected by verifyAdmin middleware (from index.js)
 */

const express = require('express');
const router = express.Router();
const scheduleExceptionController = require('../../controllers/scheduleException.controller');

/**
 * @route   GET /api/v1/admin/schedule-exceptions
 * @desc    Get all future exceptions
 * @access  Protected (Admin only)
 */
router.get('/', scheduleExceptionController.getExceptions);

/**
 * @route   POST /api/v1/admin/schedule-exceptions
 * @desc    Create or update an exception
 * @access  Protected (Admin only)
 */
router.post('/', scheduleExceptionController.upsertException);

/**
 * @route   DELETE /api/v1/admin/schedule-exceptions/:id
 * @desc    Delete an exception
 * @access  Protected (Admin only)
 */
router.delete('/:id', scheduleExceptionController.deleteException);

module.exports = router;
