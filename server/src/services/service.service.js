/**
 * Service (Dental Service) Service
 * 
 * Business logic for dental service management.
 * All CRUD operations with proper error handling.
 */

const supabase = require('../lib/supabaseClient');
const ApiError = require('../utils/apiError');

/**
 * Get all dental services with pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @returns {Promise<Array>} List of services
 */
const getAll = async (options = {}) => {
    const { page = 1, limit = 20 } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query (order by creation date to preserve insertion order)
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) {
        throw ApiError.internal('Failed to fetch services');
    }

    return data;
};

/**
 * Get service by ID
 * @param {string} id - Service ID
 * @returns {Promise<Object>} Service details
 */
const getById = async (id) => {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw ApiError.notFound('Service not found');
    }

    return data;
};

/**
 * Create new service
 * @param {Object} serviceData - Service data
 * @returns {Promise<Object>} Created service
 */
const create = async (serviceData) => {
    const { name, description, price, duration } = serviceData;

    const { data, error } = await supabase
        .from('services')
        .insert({
            name,
            description,
            price,
            duration,
        })
        .select()
        .single();

    if (error) {
        // Handle unique constraint violations
        if (error.code === '23505') {
            throw ApiError.conflict('A service with this name already exists');
        }
        throw ApiError.internal('Failed to create service');
    }

    return data;
};

/**
 * Update service
 * @param {string} id - Service ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated service
 */
const update = async (id, updates) => {
    // Verify service exists
    await getById(id);

    const { name, description, price, duration } = updates;

    // Build update object (only include provided fields)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (duration !== undefined) updateData.duration = duration;

    const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        // Handle unique constraint violations
        if (error.code === '23505') {
            throw ApiError.conflict('A service with this name already exists');
        }
        throw ApiError.internal('Failed to update service');
    }

    return data;
};

/**
 * Delete service
 * @param {string} id - Service ID
 * @returns {Promise<void>}
 */
const deleteService = async (id) => {
    // Verify service exists
    await getById(id);

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

    if (error) {
        // Handle foreign key constraints (if service has appointments)
        if (error.code === '23503') {
            throw ApiError.conflict('Cannot delete service with existing appointments');
        }
        throw ApiError.internal('Failed to delete service');
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteService,
};
