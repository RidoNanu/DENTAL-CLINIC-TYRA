/**
 * Application Constants
 * 
 * Centralized constants for the application.
 * Use these instead of magic strings.
 */

/**
 * Appointment Status Values
 * @readonly
 * @enum {string}
 */
const APPOINTMENT_STATUS = Object.freeze({
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
});

/**
 * Get all valid appointment status values as array
 * @returns {string[]} Array of valid status values
 */
const getAppointmentStatuses = () => Object.values(APPOINTMENT_STATUS);

module.exports = {
    APPOINTMENT_STATUS,
    getAppointmentStatuses,
};
