/**
 * Validation Middleware Examples
 * 
 * Reusable middleware for common validation patterns.
 * Use these in route definitions before controller handlers.
 */

const {
    validateUUID,
    validateEmail,
    validatePhone,
    validateRequired,
    validateTimestamp,
    validateEnum,
    validatePositiveNumber,
} = require('../utils/validators');
const { getAppointmentStatuses } = require('../utils/constants');

/**
 * Middleware to validate UUID params
 * Usage: router.get('/patients/:id', validateUUIDParam('id'), controller.getById)
 */
const validateUUIDParam = (paramName) => {
    return (req, res, next) => {
        try {
            validateUUID(req.params[paramName], paramName);
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware to validate patient creation/update data
 */
const validatePatientData = (req, res, next) => {
    try {
        const { name, email, phone, date_of_birth, gender, address } = req.body;

        // Required fields
        validateRequired(name, 'Name');
        validateEmail(email);
        validatePhone(phone);

        // Optional but must be valid if provided
        if (gender) {
            validateEnum(gender, ['male', 'female', 'other'], 'Gender');
        }

        if (date_of_birth) {
            validateTimestamp(date_of_birth, false); // Past dates are OK
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to validate service (dental service) data
 */
const validateServiceData = (req, res, next) => {
    try {
        const { name, description, price, duration } = req.body;

        validateRequired(name, 'Service name');
        validateRequired(description, 'Description');
        validatePositiveNumber(price, 'Price');
        validatePositiveNumber(duration, 'Duration');

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Validate appointment data for creation
 */
const validateAppointmentData = (req, res, next) => {
    try {
        const { patient_id, service_id, appointment_at, status, notes } = req.body;

        // Required fields
        validateUUID(patient_id, 'patient_id');
        validateUUID(service_id, 'service_id');
        validateTimestamp(appointment_at, true); // Require future date

        // Optional fields
        if (status !== undefined) {
            validateEnum(status, getAppointmentStatuses(), 'status');
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Validate appointment data for updates
 */
const validateAppointmentUpdateData = (req, res, next) => {
    try {
        const { patient_id, service_id, appointment_at, status } = req.body;

        // All fields are optional in update, but must be valid if provided
        if (patient_id !== undefined) {
            validateUUID(patient_id, 'patient_id');
        }

        if (service_id !== undefined) {
            validateUUID(service_id, 'service_id');
        }

        if (appointment_at !== undefined) {
            validateTimestamp(appointment_at, true); // Require future date
        }

        if (status !== undefined) {
            validateEnum(status, getAppointmentStatuses(), 'status');
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateUUIDParam,
    validatePatientData,
    validateServiceData,
    validateAppointmentData,
    validateAppointmentUpdateData,
};
