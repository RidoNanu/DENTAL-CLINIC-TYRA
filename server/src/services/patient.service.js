/**
 * Patient Service
 * 
 * Business logic for patient management.
 * All CRUD operations with proper error handling.
 */

const supabase = require('../lib/supabaseClient');
const ApiError = require('../utils/apiError');

/**
 * Get all patients with pagination and search
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.search - Search term (name or email)
 * @returns {Promise<Array>} List of patients
 */
const getAll = async (options = {}) => {
    const { page = 1, limit = 20, search = '' } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    try {
        // Build query
        let query = supabase
            .from('patients')
            .select('*', { count: 'exact' });

        // Apply search filter if provided
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Apply pagination and ordering
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('[SERVICE] Supabase error details:', JSON.stringify(error, null, 2));
            throw ApiError.internal(`Failed to fetch patients: ${error.message}`);
        }

        return data || [];
    } catch (err) {
        console.error('[SERVICE] Exception caught:', err.message);
        console.error('[SERVICE] Exception stack:', err.stack);
        throw err;
    }
};

/**
 * Get patient by ID
 * @param {string} id - Patient ID
 * @returns {Promise<Object>} Patient details
 */
const getById = async (id) => {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw ApiError.notFound('Patient not found');
    }

    return data;
};

/**
 * Create new patient
 * @param {Object} patientData - Patient data
 * @returns {Promise<Object>} Created patient
 */
const create = async (patientData) => {
    const { name, email, phone, date_of_birth, gender, notes } = patientData;

    const { data, error } = await supabase
        .from('patients')
        .insert({
            name,
            email,
            phone,
            date_of_birth: date_of_birth || null,
            gender: gender || null,
            notes: notes || null,
        })
        .select()
        .single();

    if (error) {
        console.error('[PATIENT] Failed to create patient:', error);
        console.error('[PATIENT] Patient data:', { name, email, phone, date_of_birth, gender, notes });

        // Handle unique constraint violations
        if (error.code === '23505') {
            throw ApiError.conflict('A patient with this email already exists');
        }
        throw ApiError.internal(`Failed to create patient: ${error.message || error.hint || 'Unknown error'}`);
    }

    return data;
};

/**
 * Find existing patient or create new one (for public booking)
 * @param {Object} patientData - Patient data
 * @param {string} patientData.name - Patient name
 * @param {string} patientData.email - Patient email
 * @param {string} patientData.phone - Patient phone
 * @param {string} patientData.date_of_birth - Patient date of birth
 * @param {string} patientData.gender - Patient gender
 * @param {string} patientData.notes - Patient notes
 * @returns {Promise<Object>} Patient record
 */
const findOrCreate = async ({ name, email, phone, date_of_birth, gender, notes }) => {
    // Search by email first, then phone
    let query = supabase
        .from('patients')
        .select('*')
        .limit(1);

    if (email) {
        query = query.eq('email', email);
    } else if (phone) {
        query = query.eq('phone', phone);
    }

    const { data: existing, error: searchError } = await query;

    if (searchError) {
        throw ApiError.internal('Failed to search for patient');
    }

    // If patient exists, update with new data
    if (existing && existing.length > 0) {
        const existingPatient = existing[0];

        // Build update object with new data
        const updateData = {};
        if (name && name !== existingPatient.name) updateData.name = name;
        if (email && email !== existingPatient.email) updateData.email = email;
        if (phone && phone !== existingPatient.phone) updateData.phone = phone;
        if (date_of_birth && date_of_birth !== existingPatient.date_of_birth) updateData.date_of_birth = date_of_birth;
        if (gender && gender !== existingPatient.gender) updateData.gender = gender;
        if (notes && notes !== existingPatient.notes) updateData.notes = notes;

        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
            const { data: updated, error: updateError } = await supabase
                .from('patients')
                .update(updateData)
                .eq('id', existingPatient.id)
                .select()
                .single();

            if (updateError) {
                console.error('[PATIENT] Failed to update existing patient:', updateError);
                // Return existing patient even if update fails
                return existingPatient;
            }

            return updated;
        }

        return existingPatient;
    }

    // Create new patient
    return await create({ name, email, phone, date_of_birth, gender, notes });
};

/**
 * Update patient
 * @param {string} id - Patient ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated patient
 */
const update = async (id, updates) => {
    // Verify patient exists
    await getById(id);

    const { name, email, phone, date_of_birth, gender, medical_history } = updates;

    // Build update object (only include provided fields)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
    if (gender !== undefined) updateData.gender = gender;
    if (medical_history !== undefined) updateData.medical_history = medical_history;

    const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        // Handle unique constraint violations
        if (error.code === '23505') {
            throw ApiError.conflict('A patient with this email already exists');
        }
        throw ApiError.internal('Failed to update patient');
    }

    return data;
};

/**
 * Delete patient
 * @param {string} id - Patient ID
 * @returns {Promise<void>}
 */
const deletePatient = async (id) => {
    // Verify patient exists
    await getById(id);

    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

    if (error) {
        // Handle foreign key constraints (if patient has appointments)
        if (error.code === '23503') {
            throw ApiError.conflict('Cannot delete patient with existing appointments');
        }
        throw ApiError.internal('Failed to delete patient');
    }
};

module.exports = {
    getAll,
    getById,
    create,
    findOrCreate,
    update,
    delete: deletePatient,
};
