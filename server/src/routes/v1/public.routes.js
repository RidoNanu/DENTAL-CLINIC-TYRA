/**
 * Public API Routes
 * 
 * Routes that don't require authentication.
 * Safe for public consumption (patient-facing pages).
 */

const express = require('express');
const router = express.Router();
const publicController = require('../../controllers/public.controller');
const clinicSettingsController = require('../../controllers/clinicSettings.controller');
const scheduleExceptionController = require('../../controllers/scheduleException.controller');
const { bookingLimiter } = require('../../middlewares/rateLimit.middleware');

/**
 * @swagger
 * /api/v1/public/clinic-settings:
 *   get:
 *     summary: Get clinic working hours (public)
 *     description: Returns morning and evening shift timings.
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Clinic settings object
 */
router.get('/clinic-settings', clinicSettingsController.getSettings);

/**
 * @swagger
 * /api/v1/public/schedule-exceptions:
 *   get:
 *     summary: Get schedule exceptions (public)
 *     description: Returns list of date-specific schedule overrides.
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of exceptions
 */
router.get('/schedule-exceptions', scheduleExceptionController.getExceptions);

/**
 * @swagger
 * /api/v1/public/services:
 *   get:
 *     summary: Get all dental services (public)
 *     description: Returns list of available dental services. No authentication required.
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       duration:
 *                         type: integer
 */
router.get('/services', publicController.getPublicServices);

/**
 * @swagger
 * /api/v1/public/appointments:
 *   post:
 *     summary: Book appointment (public)
 *     description: Create appointment without authentication. Handles patient creation if needed.
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient
 *               - service_id
 *               - appointment_at
 *             properties:
 *               patient:
 *                 type: object
 *                 required:
 *                   - name
 *                   - email
 *                   - phone
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *               service_id:
 *                 type: string
 *               appointment_at:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: Time slot unavailable
 */
router.post('/appointments', bookingLimiter, publicController.createPublicAppointment);

/**
 * @swagger
 * /api/v1/public/availability:
 *   get:
 *     summary: Check availability for a date range
 *     description: Get available and booked time slots for a date range and service
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: service_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Availability map keyed by date
 *       400:
 *         description: Missing required parameters
 */
router.get('/availability', publicController.getDateAvailability);

/**
 * @swagger
 * /api/v1/public/appointment/verify-token:
 *   get:
 *     summary: Verify action token validity (public)
 *     description: Validates a secure token for appointment actions
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Action token UUID
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Token invalid, expired, or already used
 */
router.get('/appointment/verify-token', publicController.verifyActionToken);

/**
 * @swagger
 * /api/v1/public/appointment/cancel:
 *   post:
 *     summary: Cancel appointment with token (public)
 *     description: Allows patients to cancel appointments via email link
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Cancellation token UUID
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       400:
 *         description: Invalid token or appointment already cancelled
 */
router.post('/appointment/cancel', publicController.cancelAppointmentWithToken);

/**
 * @swagger
 * /api/v1/public/appointment/reschedule:
 *   post:
 *     summary: Reschedule appointment with token (public)
 *     description: Allows patients to reschedule appointments via email link
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reschedule token UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_appointment_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Reschedule request submitted (pending admin approval)
 *       400:
 *         description: Invalid token or parameters
 *       409:
 *         description: Time slot already booked
 */
router.post('/appointment/reschedule', publicController.rescheduleAppointmentWithToken);

module.exports = router;

