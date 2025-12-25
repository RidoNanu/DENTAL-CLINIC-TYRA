/**
 * Appointment Service
 * 
 * Business logic for appointments with:
 * - Future date validation
 * - Service duration lookup
 * - End time calculation
 * - Overlap prevention (ignoring cancelled appointments)
 * - Shift & Token management
 */

const supabase = require('../lib/supabaseClient');
const ApiError = require('../utils/apiError');
const { APPOINTMENT_STATUS } = require('../utils/constants');

/**
 * Check if a time slot overlaps with existing appointments
 * Uses DB-level filtering for efficiency
 * @param {string} serviceId - Service ID
 * @param {Date} startTime - Appointment start time
 * @param {Date} endTime - Appointment end time
 * @param {string} excludeAppointmentId - Appointment ID to exclude (for updates)
 * @returns {Promise<boolean>} True if overlap exists
 */
const checkOverlap = async (serviceId, startTime, endTime, excludeAppointmentId = null) => {
    // Overlap condition: (StartA < EndB) and (EndA > StartB)
    let query = supabase
        .from('appointments')
        .select('id')
        .eq('service_id', serviceId)
        .neq('status', APPOINTMENT_STATUS.CANCELLED)
        .lt('appointment_at', endTime.toISOString()) // existing start < new end
        .gt('end_time', startTime.toISOString());    // existing end > new start

    // Exclude current appointment for updates
    if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
    }

    // We only need to know if at least one exists
    const { data, error } = await query.limit(1);

    if (error) {
        throw ApiError.internal('Failed to check appointment availability');
    }

    return data.length > 0;
};

/**
 * Get service duration and validate service exists
 * @param {string} serviceId - Service ID
 * @returns {Promise<number>} Duration in minutes
 */
const getServiceDuration = async (serviceId) => {
    const { data: service, error } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single();

    if (error || !service) {
        throw ApiError.notFound('Service not found or invalid');
    }

    return service.duration;
};

/**
 * Calculate appointment end time
 * @param {string} startTime - ISO timestamp
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} ISO timestamp for end time
 */
const calculateEndTime = (startTime, durationMinutes) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return end.toISOString();
};

/**
 * Get next token number for a specific date and shift
 * @param {string} dateStr - Date in YYYY-MM-DD (IST)
 * @param {string} shift - 'morning' or 'evening'
 */
const getNextToken = async (dateStr, shift) => {
    // Used to query by full datetime range in IST
    const startOfDay = `${dateStr}T00:00:00+05:30`;
    const endOfDay = `${dateStr}T23:59:59+05:30`;

    const { data, error } = await supabase
        .from('appointments')
        .select('token_number')
        .eq('shift', shift)
        .gte('appointment_at', startOfDay)
        .lte('appointment_at', endOfDay)
        .not('token_number', 'is', null) // Ignore appointments that don't have a token yet
        // We want the MAX token used so far, regardless of status (cancelled shouldn't reuse)
        .order('token_number', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw ApiError.internal('Failed to generate token');
    }

    return (data?.token_number || 0) + 1;
};


/**
 * Get all appointments with patient and service details
 * Excludes cancelled appointments by default
 * Supports pagination and date range filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.startDate - Start date filter (ISO format)
 * @param {string} options.endDate - End date filter (ISO format)
 * @returns {Promise<Array>} List of active appointments
 */
const getAll = async (options = {}) => {
    const { page = 1, limit = 20, startDate, endDate } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query - now includes ALL appointments including cancelled
    let query = supabase
        .from('appointments')
        .select(`
      *,
      patients (
        id,
        name,
        email,
        phone
      ),
      services (
        id,
        name,
        duration,
        price
      )
    `);

    // Apply date range filters if provided
    if (startDate) {
        query = query.gte('appointment_at', startDate);
    }
    if (endDate) {
        query = query.lte('appointment_at', endDate);
    }

    // Apply ordering and pagination
    const { data, error } = await query
        .order('appointment_at', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) {
        throw ApiError.internal('Failed to fetch appointments');
    }

    return data;
};

/**
 * Get appointment by ID
 * @param {string} id - Appointment ID
 * @returns {Promise<Object>} Appointment details
 */
const getById = async (id) => {
    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      patients (
        id,
        name,
        email,
        phone
      ),
      services (
        id,
        name,
        duration,
        price
      )
    `)
        .eq('id', id)
        .single();

    if (error || !data) {
        throw ApiError.notFound('Appointment not found');
    }

    return data;
};

/**
 * Create new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created appointment
 */
const create = async (appointmentData) => {
    const { patient_id, service_id, appointment_at, status = APPOINTMENT_STATUS.PENDING, notes, shift } = appointmentData;

    // 1. Validate appointment is in the future
    const startTime = new Date(appointment_at);
    if (isNaN(startTime.getTime())) {
        throw ApiError.badRequest('Invalid appointment date format');
    }

    // Check future only if strict checks needed, but for requests we allow "today" creation usually
    // Assuming appointment_at passes basic "now" check.
    // If shift is present, we might be more lenient or strict? 
    // Requirement: "Validate date (not past)"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startTime < today) {
        throw ApiError.badRequest('Appointment date must not be in the past');
    }

    // 2. Fetch service duration (validates service exists)
    const duration = await getServiceDuration(service_id);

    // 3. Calculate end time
    const endTime = calculateEndTime(appointment_at, duration);

    // 4. Check for overlapping appointments (SKIP if shift is present)
    if (!shift) {
        const hasOverlap = await checkOverlap(service_id, startTime, new Date(endTime));
        if (hasOverlap) {
            throw ApiError.conflict('Time slot unavailable: It overlaps with an existing appointment');
        }
    } else {
        // Validation for shift
        if (!['morning', 'evening'].includes(shift)) {
            throw ApiError.badRequest('Invalid shift preference. Must be morning or evening.');
        }
    }

    // 5. Create appointment
    const { data, error } = await supabase
        .from('appointments')
        .insert({
            patient_id,
            service_id,
            appointment_at,
            end_time: endTime,
            status,
            notes: notes || null,
            shift: shift || null,
            token_number: null // Always null initially
        })
        .select(`
      *,
      patients (
        id,
        name,
        email,
        phone
      ),
      services (
        id,
        name,
        duration,
        price
      )
    `)
        .single();

    if (error) {
        throw ApiError.internal('Failed to create appointment');
    }

    return data;
};

/**
 * Update appointment
 * @param {string} id - Appointment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated appointment
 */
const update = async (id, updates) => {
    // Verify appointment exists
    const currentAppointment = await getById(id);

    const { patient_id, service_id, appointment_at, status, notes, shift } = updates;

    let endTime;
    let token_number = currentAppointment.token_number;

    // If appointment time or service changed, recalculate end time and check overlap (if not shift based)
    if (appointment_at || service_id) {
        const finalServiceId = service_id || currentAppointment.service_id;
        const finalStartTime = appointment_at || currentAppointment.appointment_at;
        const finalShift = shift || currentAppointment.shift;

        // Validate future date if updating appointment_at
        if (appointment_at) {
            const startTime = new Date(appointment_at);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (startTime < today) {
                throw ApiError.badRequest('Appointment date must not be in the past');
            }
        }

        // Get duration and calculate end time
        const duration = await getServiceDuration(finalServiceId);
        endTime = calculateEndTime(finalStartTime, duration);

        // Check overlap ONLY if NOT a shift-based appointment
        if (!finalShift) {
            const hasOverlap = await checkOverlap(
                finalServiceId,
                new Date(finalStartTime),
                new Date(endTime),
                id
            );

            if (hasOverlap) {
                throw ApiError.conflict('Time slot unavailable');
            }
        }
    }

    // Handle Token Assignment on Confirmation
    if (status === 'confirmed' && currentAppointment.status !== 'confirmed') {
        const finalShift = shift || currentAppointment.shift;
        if (finalShift && !token_number) {
            // Assign token
            const dateToUse = appointment_at || currentAppointment.appointment_at;
            // Convert to IST Date string for grouping
            const istDate = new Date(dateToUse).toLocaleString('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).split(',')[0];

            token_number = await getNextToken(istDate, finalShift);
        }
    }

    // Build update object
    const updateData = {};
    if (patient_id) updateData.patient_id = patient_id;
    if (service_id) updateData.service_id = service_id;
    if (appointment_at) updateData.appointment_at = appointment_at;
    if (endTime) updateData.end_time = endTime;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (shift) updateData.shift = shift;
    if (token_number) updateData.token_number = token_number;

    const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select(`
      *,
      patients (
        id,
        name,
        email,
        phone
      ),
      services (
        id,
        name,
        duration,
        price
      )
    `)
        .single();

    if (error) {
        throw ApiError.internal('Failed to update appointment');
    }

    return data;
};

/**
 * Delete appointment (soft delete - sets status to cancelled)
 * @param {string} id - Appointment ID
 * @returns {Promise<void>}
 */
const deleteAppointment = async (id) => {
    // Verify appointment exists
    await getById(id);

    // Soft delete: update status to cancelled instead of removing row
    const { error } = await supabase
        .from('appointments')
        .update({ status: APPOINTMENT_STATUS.CANCELLED })
        .eq('id', id);

    if (error) {
        throw ApiError.internal('Failed to cancel appointment');
    }
};

/**
 * Get all appointments for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Appointments for the date
 */
const getByDate = async (date) => {
    const startOfDay = `${date}T00:00:00+05:30`;
    const endOfDay = `${date}T23:59:59+05:30`;

    const { data, error } = await supabase
        .from('appointments')
        .select('*, patient:patients(*), service:services(*)')
        .gte('appointment_at', startOfDay)
        .lte('appointment_at', endOfDay)
        .order('appointment_at', { ascending: true });

    if (error) {
        throw ApiError.internal('Failed to fetch appointments for date');
    }

    return data || [];
};

/**
 * Get all appointments within a date range
 * @param {string} startDateTime - Start datetime (ISO format with timezone)
 * @param {string} endDateTime - End datetime (ISO format with timezone)
 * @returns {Promise<Array>} Appointments in the range
 */
const getByDateRange = async (startDateTime, endDateTime) => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*, patient:patients(*), service:services(*)')
        .gte('appointment_at', startDateTime)
        .lte('appointment_at', endDateTime)
        .neq('status', 'cancelled')
        .order('appointment_at', { ascending: true });

    if (error) {
        throw ApiError.internal('Failed to fetch appointments for date range');
    }

    return data || [];
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteAppointment,
    getByDate,
    getByDateRange,
};
