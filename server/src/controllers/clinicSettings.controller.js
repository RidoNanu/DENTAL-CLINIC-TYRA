/**
 * Clinic Settings Controller
 * 
 * Handles Admin and Public API requests for clinic hours.
 */

const clinicSettingsService = require('../services/clinicSettings.service');

/**
 * Get settings (Public/Admin)
 * GET /api/v1/clinic-settings
 */
const getSettings = async (req, res, next) => {
    try {
        const settings = await clinicSettingsService.getSettings();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update settings (Admin only)
 * PUT /api/v1/admin/clinic-settings
 */
const updateSettings = async (req, res, next) => {
    try {
        const {
            morning_start_time,
            morning_end_time,
            evening_start_time,
            evening_end_time,
            morning_shift_enabled,
            evening_shift_enabled
        } = req.body;

        // Basic validation
        if (!morning_start_time || !morning_end_time || !evening_start_time || !evening_end_time) {
            return res.status(400).json({
                success: false,
                message: 'All shift timings are required'
            });
        }

        // Logic validation: Start < End
        // We'll trust the input format is HH:MM (24h) or HH:MM:SS
        // Simple string comparison works for ISO time format
        if (morning_start_time >= morning_end_time) {
            return res.status(400).json({
                success: false,
                message: 'Morning Start Time must be before End Time'
            });
        }

        if (evening_start_time >= evening_end_time) {
            return res.status(400).json({
                success: false,
                message: 'Evening Start Time must be before End Time'
            });
        }

        const updatedSettings = await clinicSettingsService.updateSettings({
            morning_start_time,
            morning_end_time,
            evening_start_time,
            evening_end_time,
            morning_shift_enabled,
            evening_shift_enabled
        });

        res.json({
            success: true,
            message: 'Clinic working hours updated successfully',
            data: updatedSettings
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSettings,
    updateSettings
};
