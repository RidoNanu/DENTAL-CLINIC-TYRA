/**
 * Service Routes
 * 
 * Routes for dental service management.
 * GET = Public, POST/PUT/DELETE = Authenticated only
 */

const express = require('express');
const router = express.Router();
const serviceController = require('../../controllers/service.controller');
const {
    validateUUIDParam,
    validateServiceData,
} = require('../../middlewares/validation.middleware');

// GET /api/v1/services - Get all services (public)
router.get('/', serviceController.getAll);

// GET /api/v1/services/:id - Get service by ID (public)
router.get('/:id', validateUUIDParam('id'), serviceController.getById);

// POST /api/v1/services - Create new service
router.post('/', validateServiceData, serviceController.create);

// PUT /api/v1/services/:id - Update service
router.put(
    '/:id',
    validateUUIDParam('id'),
    validateServiceData,
    serviceController.update
);

// DELETE /api/v1/services/:id - Delete service
router.delete('/:id', validateUUIDParam('id'), serviceController.delete);

module.exports = router;
