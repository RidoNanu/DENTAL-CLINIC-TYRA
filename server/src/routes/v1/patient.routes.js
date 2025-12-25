/**
 * Patient Routes
 * 
 * Routes for patient management.
 * Admin-only system: Any authenticated user has access.
 */

const express = require('express');
const router = express.Router();
const patientController = require('../../controllers/patient.controller');
const {
    validateUUIDParam,
    validatePatientData,
} = require('../../middlewares/validation.middleware');

// All routes protected by verifyAdmin middleware at mount level

// GET /api/v1/patients - Get all patients
router.get('/', patientController.getAll);

// GET /api/v1/patients/:id - Get patient by ID
router.get('/:id', validateUUIDParam('id'), patientController.getById);

// POST /api/v1/patients - Create new patient
router.post('/', validatePatientData, patientController.create);

// PUT /api/v1/patients/:id - Update patient
router.put(
    '/:id',
    validateUUIDParam('id'),
    validatePatientData,
    patientController.update
);

// DELETE /api/v1/patients/:id - Delete patient
router.delete('/:id', validateUUIDParam('id'), patientController.delete);

module.exports = router;
