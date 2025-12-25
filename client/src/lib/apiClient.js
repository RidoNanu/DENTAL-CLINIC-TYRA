/**
 * REST API Client
 * 
 * Unified HTTP client for all backend API requests.
 * Includes JWT authentication headers and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

/**
 * Get auth headers with JWT token
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

/**
 * Handle API errors including 401 unauthorized
 */
const handleResponse = async (response) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
        // Clear auth data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');

        // Only redirect to login if we are in the admin section
        if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
        }

        throw new Error('Authentication required');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
};

/**
 * GET request
 */
const get = async (endpoint, params = {}) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};

/**
 * POST request
 */
const post = async (endpoint, body = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
    });

    return handleResponse(response);
};

/**
 * PUT request
 */
const put = async (endpoint, body = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
    });

    return handleResponse(response);
};

/**
 * DELETE request
 */
const del = async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};

const apiClient = {
    get,
    post,
    put,
    delete: del
};

export default apiClient;
