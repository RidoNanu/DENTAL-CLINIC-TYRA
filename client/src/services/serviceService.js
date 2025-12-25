/**
 * Service API Service
 * 
 * All dental service-related API calls.
 * Communicates with backend REST API ONLY.
 */

import apiClient from '../lib/apiClient';

/**
 * Get all services with optional pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Array>} List of services
 */
export const getServices = async ({ page, limit } = {}) => {
    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/services', params);
    return response.data;
};

/**
 * Get all services (public)
 * @returns {Promise<Array>} List of services
 */
export const getPublicServices = async () => {
    const response = await apiClient.get('/public/services');
    return response.data;
};

/**
 * Get clinic settings (public)
 * @returns {Promise<Object>} Clinic settings
 */
export const getPublicClinicSettings = async () => {
    const response = await apiClient.get('/public/clinic-settings');
    return response;
};

/**
 * Get service by ID
 * @param {string} id - Service ID
 * @returns {Promise<Object>} Service data
 */
export const getService = async (id) => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
};

/**
 * Create new service
 * @param {Object} serviceData - Service data
 * @returns {Promise<Object>} Created service
 */
export const createService = async (serviceData) => {
    const response = await apiClient.post('/services', serviceData);
    return response.data;
};

/**
 * Update service
 * @param {string} id - Service ID
 * @param {Object} serviceData - Updated service data
 * @returns {Promise<Object>} Updated service
 */
export const updateService = async (id, serviceData) => {
    const response = await apiClient.put(`/services/${id}`, serviceData);
    return response.data;
};

/**
 * Delete service
 * @param {string} id - Service ID
 * @returns {Promise<void>}
 */
export const deleteService = async (id) => {
    await apiClient.delete(`/services/${id}`);
};
