/**
 * Patient Controller
 * 
 * Handles HTTP requests for patient CRUD operations.
 */

const patientService = require('../services/patient.service');

/**
 * Get all patients
 * GET /api/v1/patients?page=1&limit=20&search=john
 */
const getAll = async (req, res, next) => {
    try {
        const { page, limit, search } = req.query;

        const patients = await patientService.getAll({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            search,
        });

        res.json({
            success: true,
            data: patients,
        });
    } catch (error) {
        console.error('[CONTROLLER] Error occurred:', error.message);
        console.error('[CONTROLLER] Error stack:', error.stack);
        next(error);
    }
};

/**
 * Get patient by ID
 * GET /api/v1/patients/:id
 */
const getById = async (req, res, next) => {
    try {
        const patient = await patientService.getById(req.params.id);

        res.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new patient
 * POST /api/v1/patients
 */
const create = async (req, res, next) => {
    try {
        const patient = await patientService.create(req.body);

        res.status(201).json({
            success: true,
            data: patient,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update patient
 * PUT /api/v1/patients/:id
 */
const update = async (req, res, next) => {
    try {
        const patient = await patientService.update(req.params.id, req.body);

        res.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete patient
 * DELETE /api/v1/patients/:id
 */
const deletePatient = async (req, res, next) => {
    try {
        await patientService.delete(req.params.id);

        res.json({
            success: true,
            data: null,
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
    delete: deletePatient,
};
