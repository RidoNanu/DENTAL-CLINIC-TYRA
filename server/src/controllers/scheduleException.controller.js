/**
 * Schedule Exception Controller
 * 
 * Handles Admin requests for date-specific schedule overrides.
 */

const scheduleExceptionService = require('../services/scheduleException.service');

/**
 * Get all future exceptions
 * GET /api/v1/admin/schedule-exceptions
 */
const getExceptions = async (req, res, next) => {
    try {
        const exceptions = await scheduleExceptionService.getFutureExceptions();
        res.json({
            success: true,
            data: exceptions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upsert exception (Create/Update)
 * POST /api/v1/admin/schedule-exceptions
 */
const upsertException = async (req, res, next) => {
    try {
        const { date, is_morning_open, is_evening_open, reason,
            morning_start_time, morning_end_time,
            evening_start_time, evening_end_time } = req.body;

        // Basic validation
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        const result = await scheduleExceptionService.upsertException({
            date,
            is_morning_open,
            is_evening_open,
            reason,
            morning_start_time,
            morning_end_time,
            evening_start_time,
            evening_end_time
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete exception
 * DELETE /api/v1/admin/schedule-exceptions/:id
 */
const deleteException = async (req, res, next) => {
    try {
        const { id } = req.params;
        await scheduleExceptionService.deleteException(id);

        res.json({
            success: true,
            message: 'Schedule exception removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getExceptions,
    upsertException,
    deleteException
};
