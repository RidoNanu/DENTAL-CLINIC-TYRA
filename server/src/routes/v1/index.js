/**
 * API Routes Index
 * 
 * Mounts all v1 API routes.
 * Public routes: /public/*, /auth/*
 * Protected routes: /appointments/*, /patients/*, /services/*, /dashboard/*, /admin/*
 */

const express = require('express');
const router = express.Router();
const verifyAdmin = require('../../middlewares/verifyAdmin.middleware');

const appointmentRoutes = require('./appointment.routes');
const patientRoutes = require('./patient.routes');
const serviceRoutes = require('./service.routes');
const publicRoutes = require('./public.routes');
const dashboardRoutes = require('./dashboard.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const settingsRoutes = require('./settings.routes');
const scheduleExceptionRoutes = require('./scheduleException.routes');

// Public routes (NO authentication required)
router.use('/public', publicRoutes);
router.use('/auth', authRoutes);

// Protected admin routes - all require verifyAdmin middleware
router.use('/admin', verifyAdmin, adminRoutes);
router.use('/admin/schedule-exceptions', verifyAdmin, scheduleExceptionRoutes);
router.use('/settings', verifyAdmin, settingsRoutes);
router.use('/appointments', verifyAdmin, appointmentRoutes);
router.use('/patients', verifyAdmin, patientRoutes);
router.use('/services', verifyAdmin, serviceRoutes);
router.use('/dashboard', verifyAdmin, dashboardRoutes);

module.exports = router;
