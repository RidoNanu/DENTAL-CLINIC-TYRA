/**
 * Appointment Routes
 * 
 * Routes for appointment management.
 * Admin-only system: Any authenticated user has access.
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../../controllers/appointment.controller');
const { validateUUIDParam, validateAppointmentData, validateAppointmentUpdateData } = require('../../middlewares/validation.middleware');

// All routes are now protected by verifyAdmin middleware at mount level (see routes/v1/index.js)


// GET /api/v1/appointments - Get all appointments
router.get('/', appointmentController.getAll);

// GET /api/v1/appointments/:id - Get appointment by ID
router.get('/:id', validateUUIDParam('id'), appointmentController.getById);

// POST /api/v1/appointments - Create new appointment
router.post('/', validateAppointmentData, appointmentController.create);

// PUT /api/v1/appointments/:id - Update appointment
router.put(
    '/:id',
    validateUUIDParam('id'),
    validateAppointmentUpdateData,
    appointmentController.update
);

// DELETE /api/v1/appointments/:id - Delete appointment
router.delete('/:id', validateUUIDParam('id'), appointmentController.delete);

module.exports = router;
