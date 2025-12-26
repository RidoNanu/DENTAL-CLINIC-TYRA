/**
 * Appointment API Service
 * 
 * All appointment-related API calls.
 * Communicates with backend REST API ONLY.
 */

import apiClient from '../lib/apiClient';

/**
 * Get all appointments with optional pagination and date filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.startDate - Start date (ISO format)
 * @param {string} options.endDate - End date (ISO format)
 * @returns {Promise<Array>} List of appointments
 */
export const getAppointments = async ({ page, limit, startDate, endDate } = {}) => {
    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/appointments', params);
    return response.data;
};

/**
 * Get appointments for a specific date (for checking availability)
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} List of appointments for that date
 */
export const getAppointmentsByDate = async (date) => {
    const startDate = `${date}T00:00:00+05:30`;
    const endDate = `${date}T23:59:59+05:30`;

    const response = await apiClient.get('/appointments', {
        startDate,
        endDate,
        limit: 100 // Get all appointments for the day
    });
    return response.data;
};

/**
 * Get appointments within a date range
 * @param {string} start - Start date in YYYY-MM-DD format
 * @param {string} end - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} List of appointments in the range
 */
export const getAppointmentsByDateRange = async (start, end) => {
    const startDate = `${start}T00:00:00+05:30`;
    const endDate = `${end}T23:59:59+05:30`;

    const response = await apiClient.get('/appointments', {
        startDate,
        endDate,
        limit: 1000 // Large limit to get all appointments
    });
    return response.data;
};

/**
 * Get appointment by ID
 * @param {string} id - Appointment ID
 * @returns {Promise<Object>} Appointment data with patient and service details
 */
export const getAppointment = async (id) => {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
};

/**
 * Create new appointment
 * @param {Object} appointmentData - Appointment data
 * @param {string} appointmentData.patient_id - Patient ID
 * @param {string} appointmentData.service_id - Service ID
 * @param {string} appointmentData.appointment_at - Appointment date/time (ISO format)
 * @param {string} appointmentData.status - Appointment status (optional)
 * @param {string} appointmentData.notes - Notes (optional)
 * @returns {Promise<Object>} Created appointment
 */
export const createAppointment = async (appointmentData) => {
    const response = await apiClient.post('/appointments', appointmentData);
    return response.data;
};

/**
 * Update appointment
 * @param {string} id - Appointment ID
 * @param {Object} appointmentData - Updated appointment data
 * @returns {Promise<Object>} Updated appointment
 */
export const updateAppointment = async (id, appointmentData) => {
    const response = await apiClient.put(`/appointments/${id}`, appointmentData);
    return response.data;
};

/**
 * Delete/Cancel appointment (soft delete)
 * @param {string} id - Appointment ID
 * @returns {Promise<void>}
 */
export const deleteAppointment = async (id) => {
    await apiClient.delete(`/appointments/${id}`);
};
