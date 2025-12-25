/**
 * Clinic Settings Service
 * 
 * Manages the single source of truth for clinic working hours.
 */

const supabase = require('../lib/supabaseClient');
const ApiError = require('../utils/apiError');

/**
 * Get clinic settings
 * @returns {Promise<Object>} Settings object
 */
const getSettings = async () => {
    // We expect exactly one row, likely with a known ID or just the first one.
    // Since we seeded a specific UUID, we could query by that, or just limit 1.
    const { data, error } = await supabase
        .from('clinic_schedule_settings')
        .select('*')
        .limit(1)
        .single(); // .single() enforces exactly one row result

    if (error) {
        console.error('Error fetching clinic settings:', error);
        throw ApiError.internal('Failed to retrieve clinic settings');
    }

    return data;
};

/**
 * Update clinic settings
 * @param {Object} updateData - Partial update for timings
 * @returns {Promise<Object>} Updated settings
 */
const updateSettings = async (updateData) => {
    // Whitelist allowed fields to prevent arbitrary updates if any
    const {
        morning_start_time,
        morning_end_time,
        evening_start_time,
        evening_end_time,
        morning_shift_enabled,
        evening_shift_enabled
    } = updateData;

    // TODO: Add strict validation (start < end) here if not done in controller

    // Update the single row. We can target by the specific ID we seeded
    // or just valid logic since we know there's only one row.
    const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

    const { data, error } = await supabase
        .from('clinic_schedule_settings')
        .update({
            morning_start_time,
            morning_end_time,
            evening_start_time,
            evening_end_time,
            morning_shift_enabled,
            evening_shift_enabled
        })
        .eq('id', SETTINGS_ID)
        .select()
        .single();

    if (error) {
        console.error('Error updating clinic settings:', error);
        throw ApiError.internal('Failed to update clinic settings');
    }

    return data;
};

module.exports = {
    getSettings,
    updateSettings
};
