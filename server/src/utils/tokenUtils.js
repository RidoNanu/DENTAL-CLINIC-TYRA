/**
 * Token Utilities for Appointment Actions
 * 
 * Provides secure token generation, validation, and management
 * for email-based appointment cancel/reschedule functionality.
 */

const { v4: uuidv4 } = require('uuid');
const supabase = require('../lib/supabaseClient');

/**
 * Generate a secure action token for an appointment
 * @param {string} appointmentId - UUID of the appointment
 * @param {string} actionType - 'cancel' or 'reschedule'
 * @returns {Promise<string>} - The generated token UUID
 */
const generateActionToken = async (appointmentId, actionType) => {
    if (!appointmentId || !actionType) {
        throw new Error('appointmentId and actionType are required');
    }

    if (!['cancel', 'reschedule'].includes(actionType)) {
        throw new Error('actionType must be "cancel" or "reschedule"');
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiration

    const { data, error } = await supabase
        .from('appointment_action_tokens')
        .insert({
            appointment_id: appointmentId,
            token,
            action_type: actionType,
            expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error generating action token:', error);
        throw new Error('Failed to generate action token');
    }

    return token;
};

/**
 * Validate an action token
 * @param {string} token - The token UUID to validate
 * @returns {Promise<object|null>} - Token data if valid, null if invalid
 */
const validateActionToken = async (token) => {
    if (!token) {
        return null;
    }

    const { data, error } = await supabase
        .from('appointment_action_tokens')
        .select(`
            *,
            appointments (
                *,
                patients (id, name, email, phone),
                services (id, name, duration, price)
            )
        `)
        .eq('token', token)
        .single();

    if (error || !data) {
        return null;
    }

    // Check if token is already used
    if (data.used_at) {
        return { valid: false, reason: 'TOKEN_ALREADY_USED', data };
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    if (now > expiresAt) {
        return { valid: false, reason: 'TOKEN_EXPIRED', data };
    }

    // Check if appointment is already cancelled (token becomes invalid)
    if (data.appointments && data.appointments.status === 'cancelled') {
        return { valid: false, reason: 'APPOINTMENT_CANCELLED', data };
    }

    return { valid: true, data };
};

/**
 * Mark a token as used
 * @param {string} token - The token UUID to mark as used
 * @returns {Promise<boolean>} - True if successful
 */
const markTokenAsUsed = async (token) => {
    if (!token) {
        throw new Error('Token is required');
    }

    const { error } = await supabase
        .from('appointment_action_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

    if (error) {
        console.error('Error marking token as used:', error);
        throw new Error('Failed to mark token as used');
    }

    return true;
};

/**
 * Cleanup expired tokens (can be run as a cron job)
 * Removes tokens that are older than 48 hours
 * @returns {Promise<number>} - Number of tokens deleted
 */
const cleanupExpiredTokens = async () => {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 48); // Delete tokens older than 48 hours

    const { data, error } = await supabase
        .from('appointment_action_tokens')
        .delete()
        .lt('expires_at', cutoffDate.toISOString())
        .select();

    if (error) {
        console.error('Error cleaning up expired tokens:', error);
        return 0;
    }

    return data ? data.length : 0;
};

/**
 * Invalidate all tokens for a specific appointment
 * Useful when admin cancels an appointment
 * @param {string} appointmentId - UUID of the appointment
 * @returns {Promise<boolean>} - True if successful
 */
const invalidateAppointmentTokens = async (appointmentId) => {
    if (!appointmentId) {
        throw new Error('appointmentId is required');
    }

    const { error } = await supabase
        .from('appointment_action_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('appointment_id', appointmentId)
        .is('used_at', null);

    if (error) {
        console.error('Error invalidating appointment tokens:', error);
        throw new Error('Failed to invalidate tokens');
    }

    return true;
};

module.exports = {
    generateActionToken,
    validateActionToken,
    markTokenAsUsed,
    cleanupExpiredTokens,
    invalidateAppointmentTokens,
};
