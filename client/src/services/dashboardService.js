/**
 * Dashboard Service
 * 
 * Handles dashboard statistics API calls
 */

import apiClient from '../lib/apiClient';

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard stats data
 */
export const getDashboardStats = async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
};
