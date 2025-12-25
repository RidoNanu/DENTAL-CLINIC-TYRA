/**
 * Service (Dental Service) Controller
 * 
 * Handles HTTP requests for dental service CRUD operations.
 */

const serviceService = require('../services/service.service');

/**
 * Get all services
 * GET /api/v1/services?page=1&limit=20
 */
const getAll = async (req, res, next) => {
    try {
        const { page, limit } = req.query;

        const services = await serviceService.getAll({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });

        res.json({
            success: true,
            data: services,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get service by ID
 * GET /api/v1/services/:id
 */
const getById = async (req, res, next) => {
    try {
        const service = await serviceService.getById(req.params.id);

        res.json({
            success: true,
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new service
 * POST /api/v1/services
 */
const create = async (req, res, next) => {
    try {
        const service = await serviceService.create(req.body);

        res.status(201).json({
            success: true,
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update service
 * PUT /api/v1/services/:id
 */
const update = async (req, res, next) => {
    try {
        const service = await serviceService.update(req.params.id, req.body);

        res.json({
            success: true,
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete service
 * DELETE /api/v1/services/:id
 */
const deleteService = async (req, res, next) => {
    try {
        await serviceService.delete(req.params.id);

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
    delete: deleteService,
};
