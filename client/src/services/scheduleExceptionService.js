/**
 * Schedule Exception Service
 * Client-side API for managing schedule exceptions
 */

import apiClient from '../lib/apiClient';

/**
 * Get all schedule exceptions (Public)
 */
export const getPublicScheduleExceptions = async () => {
    const response = await apiClient.get('/public/schedule-exceptions');
    return response.data;
};

/**
 * Get all schedule exceptions (Admin)
 */
export const getAdminScheduleExceptions = async () => {
    const response = await apiClient.get('/admin/schedule-exceptions');
    return response.data;
};

/**
 * Create or Update exception (Admin)
 * @param {Object} exceptionData { date, is_morning_open, is_evening_open, reason }
 */
export const upsertScheduleException = async (exceptionData) => {
    const response = await apiClient.post('/admin/schedule-exceptions', exceptionData);
    return response.data;
};

/**
 * Delete exception (Admin)
 */
export const deleteScheduleException = async (id) => {
    const response = await apiClient.delete(`/admin/schedule-exceptions/${id}`);
    return response.data;
};
