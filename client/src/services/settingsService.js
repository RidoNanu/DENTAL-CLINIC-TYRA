/**
 * Settings Service
 * API client for admin settings
 */

import apiClient from '../lib/apiClient';

/**
 * Get clinic settings
 */
export const getClinicSettings = async () => {
    const response = await apiClient.get('/settings/clinic');
    return response;
};

/**
 * Update clinic settings
 */
export const updateClinicSettings = async (settings) => {
    const response = await apiClient.put('/settings/clinic', settings);
    return response;
};

/**
 * Get clinic schedule
 */
export const getClinicSchedule = async () => {
    // This hits the Public or Admin endpoint depending on what we need. 
    // Admin page uses this to load editable values.
    const response = await apiClient.get('/admin/clinic-settings');
    return response;
};

/**
 * Update clinic schedule
 */
export const updateClinicSchedule = async (schedule) => {
    const response = await apiClient.put('/admin/clinic-settings', schedule);
    return response;
};

/**
 * Update notification settings
 */
export const getNotificationSettings = async () => {
    const response = await apiClient.get('/settings/notifications');
    return response;
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (settings) => {
    const response = await apiClient.put('/settings/notifications', settings);
    return response;
};

/**
 * Get system information
 */
export const getSystemInfo = async () => {
    const response = await apiClient.get('/settings/system-info');
    return response;
};

/**
 * Change admin password
 */
export const changePassword = async (currentPassword, newPassword) => {
    const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
    });
    return response.data;
};
