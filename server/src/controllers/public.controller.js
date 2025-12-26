/**
 * Public API Controller
 * 
 * Handles public API endpoints that don't require authentication.
 */

const serviceService = require('../services/service.service');
const patientService = require('../services/patient.service');
const appointmentService = require('../services/appointment.service');
const emailService = require('../services/email.service');
const scheduleExceptionService = require('../services/scheduleException.service');
const clinicSettingsService = require('../services/clinicSettings.service');
const { validateActionToken, markTokenAsUsed } = require('../utils/tokenUtils');

/**
 * Get all services (public endpoint)
 * GET /api/v1/public/services
 * 
 * Returns only safe, public fields
 */
const getPublicServices = async (req, res, next) => {
    try {
        const services = await serviceService.getAll();

        // Return only safe public fields
        const publicServices = services.map(service => ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
        }));

        res.json({
            success: true,
            data: publicServices,
        });
    } catch (error) {
        console.error('[PUBLIC] Error fetching services:', error.message);
        next(error);
    }
};

/**
 * Create appointment (public endpoint)
 * POST /api/v1/public/appointments
 * 
 * Handles patient creation and appointment booking without authentication
 */
const createPublicAppointment = async (req, res, next) => {
    try {
        const { patient, service_id, appointment_at, notes, shift } = req.body;

        // Validate required fields
        if (!patient || !patient.name || !patient.phone || !patient.email) {
            return res.status(400).json({
                success: false,
                message: 'Patient name, phone, and email are required'
            });
        }

        if (!service_id || !appointment_at) {
            return res.status(400).json({
                success: false,
                message: 'Service ID and appointment date are required'
            });
        }

        // Strict date validation
        if (isNaN(new Date(appointment_at).getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date/time format'
            });
        }

        // Validate shift if present
        if (shift && !['morning', 'evening'].includes(shift)) {
            return res.status(400).json({
                success: false,
                message: 'Shift must be either "morning" or "evening"'
            });
        }

        // Validate Shift Availability (Exception > Global)
        if (shift) {
            const dateStr = new Date(appointment_at).toISOString().split('T')[0];

            // 1. Check for Date-Specific Exception
            const exception = await scheduleExceptionService.getExceptionByDate(dateStr);
            let isAllowed = true;

            if (exception) {
                if (shift === 'morning' && !exception.is_morning_open) isAllowed = false;
                if (shift === 'evening' && !exception.is_evening_open) isAllowed = false;
            } else {
                // 2. Fallback to Global Settings
                const settings = await clinicSettingsService.getSettings();
                if (shift === 'morning' && !settings.morning_shift_enabled) isAllowed = false;
                if (shift === 'evening' && !settings.evening_shift_enabled) isAllowed = false;
            }

            if (!isAllowed) {
                return res.status(400).json({
                    success: false,
                    message: `The ${shift} shift is not available on this date.`
                });
            }
        }

        // 1. Find or create patient
        const patientRecord = await patientService.findOrCreate({
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            date_of_birth: patient.date_of_birth || null,
            gender: patient.gender || null,
            notes: patient.notes || null
        });

        // 2. Create appointment

        // Handling Name Mismatch (Booking for someone else)
        let finalNotes = notes || '';
        if (patient.name && patientRecord.name && patient.name.trim().toLowerCase() !== patientRecord.name.trim().toLowerCase()) {
            const bookingNote = `Booked as: ${patient.name}`;
            finalNotes = finalNotes ? `${finalNotes}\n${bookingNote}` : bookingNote;
        }

        // FORCE 'pending' status - ignoring any status sent from frontend
        const appointmentData = {
            patient_id: patientRecord.id,
            service_id,
            appointment_at,
            notes: finalNotes || null,
            status: 'pending', // Hardcoded for security
            shift: shift || null
        };

        const appointment = await appointmentService.create(appointmentData);

        // Send email notification (async/non-blocking)
        const emailPromise = emailService.sendAppointmentRequested(
            patientRecord.name,
            patientRecord.email,
            appointment.appointment_at,
            appointment.services?.name || 'Dental Service',
            appointment.shift
        ).catch(err => console.error('[EMAIL JOB] Failed:', err.message));

        res.status(201).json({
            success: true,
            data: {
                appointment_id: appointment.id,
                patient: {
                    id: patientRecord.id,
                    name: patientRecord.name,
                    email: patientRecord.email,
                    phone: patientRecord.phone
                },
                scheduled_for: appointment.appointment_at,
                shift: appointment.shift,
                status: appointment.status
            },
            message: 'Appointment request submitted successfully'
        });
    } catch (error) {
        // Handle specific service errors gracefully
        if (error.statusCode === 409) {
            return res.status(409).json({
                success: false,
                message: error.message || 'This time/shift is already fully booked'
            });
        }

        if (error.statusCode === 400) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error('[PUBLIC] Error creating appointment:', error.message);
        next(error);
    }
};

/**
 * Helper: Generate all time slots (9 AM - 6 PM, 30-min intervals)
 */
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(time);
        }
    }
    return slots;
};

/**
 * Check availability for a date range
 * GET /api/v1/public/availability?start=YYYY-MM-DD&end=YYYY-MM-DD&service_id=uuid
 */
const getDateAvailability = async (req, res, next) => {
    try {
        const { start, end, service_id } = req.query;

        if (!start || !end || !service_id) {
            return res.status(400).json({
                success: false,
                message: 'start, end, and service_id query parameters are required'
            });
        }

        // Get service to determine duration
        const service = await serviceService.getById(service_id);
        const duration = service?.duration || 30;

        // Fetch all appointments in the date range (query in IST)
        const startDateTime = `${start}T00:00:00+05:30`;
        const endDateTime = `${end}T23:59:59+05:30`;

        const appointments = await appointmentService.getByDateRange(startDateTime, endDateTime);

        // Generate all possible time slots (9 AM - 6 PM, 30-min intervals)
        const allSlots = generateTimeSlots();

        // Group appointments by IST date
        const appointmentsByDate = {};
        appointments.forEach(apt => {
            const aptStart = new Date(apt.appointment_at);
            // Convert to IST and extract date (YYYY-MM-DD)
            const istDate = aptStart.toLocaleString('en-CA', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).split(',')[0];

            if (!appointmentsByDate[istDate]) {
                appointmentsByDate[istDate] = [];
            }
            appointmentsByDate[istDate].push(apt);
        });

        // Build result for each date in range
        const result = {};

        // Parse dates as local dates (no timezone conversion)
        let [y, m, d] = start.split('-').map(Number);
        const currentDate = new Date(y, m - 1, d);

        [y, m, d] = end.split('-').map(Number);
        const lastDate = new Date(y, m - 1, d);

        while (currentDate <= lastDate) {
            // Format as YYYY-MM-DD
            const dateStr = currentDate.toISOString().split('T')[0];

            const dateAppointments = appointmentsByDate[dateStr] || [];

            // Step 1: Find which slots are blocked by existing appointments
            const blockedByAppointments = new Set();

            dateAppointments.forEach(apt => {
                const aptStart = new Date(apt.appointment_at);
                const aptEnd = new Date(apt.end_time);

                allSlots.forEach(slot => {
                    const slotStart = new Date(`${dateStr}T${slot}:00+05:30`);

                    // Block slots that start during existing appointment
                    if (slotStart >= aptStart && slotStart < aptEnd) {
                        blockedByAppointments.add(slot);
                    }
                });
            });

            // Step 2: Check which slots have enough consecutive time available
            const bookedSlotsSet = new Set();
            const availableSlotsArray = [];

            allSlots.forEach((slot, index) => {
                // Skip if this slot itself is blocked by an appointment
                if (blockedByAppointments.has(slot)) {
                    bookedSlotsSet.add(slot);
                    return;
                }

                // Check if there's enough consecutive time for this service
                const slotsNeeded = Math.ceil(duration / 30); // How many 30-min slots needed
                let hasEnoughTime = true;

                // Check if all required consecutive slots are free
                for (let i = 0; i < slotsNeeded; i++) {
                    const nextSlotIndex = index + i;
                    if (nextSlotIndex >= allSlots.length) {
                        // Not enough slots left in the day
                        hasEnoughTime = false;
                        break;
                    }

                    const nextSlot = allSlots[nextSlotIndex];
                    if (blockedByAppointments.has(nextSlot)) {
                        // One of the required slots is blocked
                        hasEnoughTime = false;
                        break;
                    }
                }

                if (hasEnoughTime) {
                    availableSlotsArray.push(slot);
                } else {
                    bookedSlotsSet.add(slot);
                }
            });

            const bookedSlots = Array.from(bookedSlotsSet);
            const availableSlots = availableSlotsArray;

            result[dateStr] = {
                is_fully_booked: availableSlots.length === 0,
                booked_slots: bookedSlots,
                available_slots: availableSlots
            };

            // Next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[PUBLIC] Error checking availability:', error.message);
        next(error);
    }
};

/**
 * Verify action token (public endpoint)
 * GET /api/v1/public/appointment/verify-token?token=XYZ
 */
const verifyActionToken = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        const validation = await validateActionToken(token);

        if (!validation || !validation.valid) {
            const errorMessages = {
                TOKEN_ALREADY_USED: 'This action has already been completed.',
                TOKEN_EXPIRED: 'This action link has expired. Please contact us for assistance.',
                APPOINTMENT_CANCELLED: 'This appointment has already been cancelled.'
            };

            return res.status(400).json({
                success: false,
                message: errorMessages[validation?.reason] || 'This action link is invalid or has expired.'
            });
        }

        res.json({
            success: true,
            data: {
                action_type: validation.data.action_type,
                appointment: {
                    id: validation.data.appointments.id,
                    patient_name: validation.data.appointments.patients?.name,
                    service_name: validation.data.appointments.services?.name,
                    appointment_at: validation.data.appointments.appointment_at,
                    status: validation.data.appointments.status,
                    shift: validation.data.appointments.shift,
                    token_number: validation.data.appointments.token_number
                }
            }
        });
    } catch (error) {
        console.error('[PUBLIC] Error verifying token:', error.message);
        next(error);
    }
};

/**
 * Cancel appointment with token (public endpoint)
 * POST /api/v1/public/appointment/cancel?token=XYZ
 */
const cancelAppointmentWithToken = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        // Validate token
        const validation = await validateActionToken(token);

        if (!validation || !validation.valid) {
            const errorMessages = {
                TOKEN_ALREADY_USED: 'This action has already been completed.',
                TOKEN_EXPIRED: 'This action link has expired. Please contact us for assistance.',
                APPOINTMENT_CANCELLED: 'This appointment has already been cancelled.'
            };

            return res.status(400).json({
                success: false,
                message: errorMessages[validation?.reason] || 'This action link is invalid or has expired.'
            });
        }

        // Ensure it's a cancel token
        if (validation.data.action_type !== 'cancel') {
            return res.status(400).json({
                success: false,
                message: 'Invalid action type for this operation'
            });
        }

        const appointment = validation.data.appointments;

        // Double-check appointment status
        if (appointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'This appointment has already been cancelled.'
            });
        }

        // Cancel the appointment
        await appointmentService.update(appointment.id, { status: 'cancelled' });

        // Mark token as used
        await markTokenAsUsed(token);

        // Send cancellation confirmation email
        const emailPromise = emailService.sendAppointmentCancelled(
            appointment.patients?.name || 'Patient',
            appointment.patients?.email,
            appointment.appointment_at,
            'Cancelled by patient via email',
            appointment.shift
        ).catch(err => console.error('[EMAIL] Failed to send cancellation email:', err.message));

        res.json({
            success: true,
            message: 'Your appointment has been cancelled successfully.',
            data: {
                appointment_id: appointment.id,
                cancelled_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('[PUBLIC] Error cancelling appointment:', error.message);
        next(error);
    }
};

/**
 * Reschedule appointment with token (public endpoint)
 * POST /api/v1/public/appointment/reschedule?token=XYZ
 * Body: { new_appointment_at: ISO datetime }
 */
const rescheduleAppointmentWithToken = async (req, res, next) => {
    try {
        const { token } = req.query;
        const { new_appointment_at } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        if (!new_appointment_at) {
            return res.status(400).json({
                success: false,
                message: 'New appointment date and time are required'
            });
        }

        // Validate date format
        if (isNaN(new Date(new_appointment_at).getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date/time format'
            });
        }

        // Validate token
        const validation = await validateActionToken(token);

        if (!validation || !validation.valid) {
            const errorMessages = {
                TOKEN_ALREADY_USED: 'This action has already been completed.',
                TOKEN_EXPIRED: 'This action link has expired. Please contact us for assistance.',
                APPOINTMENT_CANCELLED: 'This appointment has already been cancelled.'
            };

            return res.status(400).json({
                success: false,
                message: errorMessages[validation?.reason] || 'This action link is invalid or has expired.'
            });
        }

        // Ensure it's a reschedule token
        if (validation.data.action_type !== 'reschedule') {
            return res.status(400).json({
                success: false,
                message: 'Invalid action type for this operation'
            });
        }

        const appointment = validation.data.appointments;

        // Update appointment with new date/time and set status to pending
        const updatedAppointment = await appointmentService.update(appointment.id, {
            appointment_at: new_appointment_at,
            status: 'pending' // Requires admin re-approval
        });

        // Mark token as used
        await markTokenAsUsed(token);

        // Send reschedule notification email
        const emailPromise = emailService.sendAppointmentRequested(
            appointment.patients?.name || 'Patient',
            appointment.patients?.email,
            new_appointment_at,
            appointment.services?.name || 'Dental Service'
        ).catch(err => console.error('[EMAIL] Failed to send reschedule email:', err.message));

        res.json({
            success: true,
            message: 'Your reschedule request has been submitted and awaits confirmation.',
            data: {
                appointment_id: appointment.id,
                new_appointment_at: new_appointment_at,
                status: 'pending'
            }
        });
    } catch (error) {
        // Handle specific service errors
        if (error.statusCode === 409) {
            return res.status(409).json({
                success: false,
                message: error.message || 'This time slot is already booked. Please select a different time.'
            });
        }

        console.error('[PUBLIC] Error rescheduling appointment:', error.message);
        next(error);
    }
};

module.exports = {
    getPublicServices,
    createPublicAppointment,
    getDateAvailability,
    verifyActionToken,
    cancelAppointmentWithToken,
    rescheduleAppointmentWithToken,
};
