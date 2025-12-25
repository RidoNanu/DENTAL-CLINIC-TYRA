/**
 * Patient API Service
 * 
 * All patient-related API calls.
 * Communicates with backend REST API ONLY.
 */

import apiClient from '../lib/apiClient';

/**
 * Get all patients with optional pagination and search
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search term
 * @returns {Promise<Array>} List of patients
 */
export const getPatients = async ({ page, limit, search } = {}) => {
    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (search) params.search = search;

    const response = await apiClient.get('/patients', params);
    return response.data;
};

/**
 * Get patient by ID
 * @param {string} id - Patient ID
 * @returns {Promise<Object>} Patient data
 */
export const getPatient = async (id) => {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
};

/**
 * Create new patient
 * @param {Object} patientData - Patient data
 * @returns {Promise<Object>} Created patient
 */
export const createPatient = async (patientData) => {
    const response = await apiClient.post('/patients', patientData);
    return response.data;
};

/**
 * Find existing patient or create new one
 * Used for public booking flow where patient may not have account
 * @param {Object} patientData - Patient information
 * @param {string} patientData.name - Patient name
 * @param {string} patientData.email - Patient email
 * @param {string} patientData.phone - Patient phone
 * @returns {Promise<Object>} Patient object with id
 */
export const findOrCreatePatient = async ({ name, email, phone }) => {
    // Try to find existing patient by email or phone
    try {
        const patients = await getPatients({ search: email || phone, limit: 1 });

        if (patients && patients.length > 0) {
            return patients[0]; // Return existing patient
        }
    } catch (error) {
        console.error('Error searching for patient:', error);
        // Continue to create new patient
    }

    // Create new patient if not found
    return await createPatient({ name, email, phone });
};

/**
 * Update patient
 * @param {string} id - Patient ID
 * @param {Object} patientData - Updated patient data
 * @returns {Promise<Object>} Updated patient
 */
export const updatePatient = async (id, patientData) => {
    const response = await apiClient.put(`/patients/${id}`, patientData);
    return response.data;
};

/**
 * Delete patient
 * @param {string} id - Patient ID
 * @returns {Promise<void>}
 */
export const deletePatient = async (id) => {
    await apiClient.delete(`/patients/${id}`);
};
