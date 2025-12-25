/**
 * Schedule Exception Service
 * 
 * Manages date-specific overrides for clinic schedule.
 */

const supabase = require('../lib/supabaseClient');
const ApiError = require('../utils/apiError');

/**
 * Get all future exceptions (from today onwards)
 * @returns {Promise<Array>} List of exceptions
 */
const getFutureExceptions = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('clinic_schedule_exceptions')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching schedule exceptions:', error);
        throw ApiError.internal('Failed to retrieve schedule exceptions');
    }

    return data;
};

/**
 * Get exception by date
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Object>} Exception object or null
 */
const getExceptionByDate = async (date) => {
    const { data, error } = await supabase
        .from('clinic_schedule_exceptions')
        .select('*')
        .eq('date', date)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is no rows found
        console.error('Error fetching exception by date:', error);
        throw ApiError.internal('Failed to check schedule exception');
    }

    return data;
};

/**
 * Upsert exception (Create or Update)
 * @param {Object} exceptionData
 * @returns {Promise<Object>} Created/Updated exception
 */
const upsertException = async (exceptionData) => {
    const { date, is_morning_open, is_evening_open, reason,
        morning_start_time, morning_end_time,
        evening_start_time, evening_end_time } = exceptionData;

    if (!date) {
        throw ApiError.badRequest('Date is required');
    }

    // Upsert using the unique date constraint
    const { data, error } = await supabase
        .from('clinic_schedule_exceptions')
        .upsert({
            date,
            is_morning_open,
            is_evening_open,
            reason,
            morning_start_time: morning_start_time || null,
            morning_end_time: morning_end_time || null,
            evening_start_time: evening_start_time || null,
            evening_end_time: evening_end_time || null,
            updated_at: new Date().toISOString()
        }, { onConflict: 'date' })
        .select()
        .single();

    if (error) {
        console.error('Error upserting schedule exception:', error);
        throw ApiError.internal('Failed to save schedule exception');
    }

    return data;
};

/**
 * Delete exception by ID
 * @param {string} id 
 */
const deleteException = async (id) => {
    const { error } = await supabase
        .from('clinic_schedule_exceptions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting schedule exception:', error);
        throw ApiError.internal('Failed to delete schedule exception');
    }

    return true;
};

module.exports = {
    getFutureExceptions,
    getExceptionByDate,
    upsertException,
    deleteException
};
