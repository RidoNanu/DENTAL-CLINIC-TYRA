/**
 * Appointment Controller
 * 
 * Handles HTTP requests for appointment CRUD operations.
 */

const appointmentService = require('../services/appointment.service');
const emailService = require('../services/email.service');

/**
 * Get all appointments
 * GET /api/v1/appointments?page=1&limit=20&startDate=2025-01-01&endDate=2025-12-31
 */
const getAll = async (req, res, next) => {
    try {
        const { page, limit, startDate, endDate } = req.query;

        const appointments = await appointmentService.getAll({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            startDate,
            endDate,
        });

        res.json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get appointment by ID
 * GET /api/v1/appointments/:id
 */
const getById = async (req, res, next) => {
    try {
        const appointment = await appointmentService.getById(req.params.id);

        res.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new appointment
 * POST /api/v1/appointments
 */
const create = async (req, res, next) => {
    try {
        const appointment = await appointmentService.create(req.body);

        res.status(201).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update appointment
 * PUT /api/v1/appointments/:id
 */
const update = async (req, res, next) => {
    try {
        // 1. Get current status BEFORE update to avoid duplicate emails
        const currentAppointment = await appointmentService.getById(req.params.id);
        const oldStatus = currentAppointment.status?.toLowerCase();

        // 2. Perform Update
        const appointment = await appointmentService.update(req.params.id, req.body);

        // 3. Check if status CHANGED and trigger email
        if (req.body.status) {
            const newStatus = req.body.status.toLowerCase();

            // Only send if status actually changed
            if (oldStatus !== newStatus) {
                const { patients: patient, services: service, appointment_at } = appointment;

                if (newStatus === 'confirmed') {
                    emailService.sendAppointmentConfirmed(
                        patient.name,
                        patient.email,
                        appointment_at,
                        service.name,
                        appointment.id,
                        appointment.shift,
                        appointment.token_number
                    ).catch(err => console.error('[EMAIL ERROR] Confirmation failed:', err.message));
                } else if (newStatus === 'cancelled') {
                    // Pass cancellation reason or notes if available
                    const reason = req.body.notes || 'Administrative decision';
                    emailService.sendAppointmentCancelled(
                        patient.name,
                        patient.email,
                        appointment_at,
                        reason
                    ).catch(err => console.error('[EMAIL ERROR] Cancellation failed:', err.message));
                }
                // Do nothing for 'completed' or 'pending'
            }
        }

        res.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete appointment
 * DELETE /api/v1/appointments/:id
 */
const deleteAppointment = async (req, res, next) => {
    try {
        await appointmentService.delete(req.params.id);

        res.json({
            success: true,
            data: null, // Consistent with standard format
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteAppointment,
};
