/**
 * Authentication Routes
 * 
 * Public routes for admin login.
 */

const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const verifyAdmin = require('../../middlewares/verifyAdmin.middleware');

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@tyradentistree.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Missing email or password
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change admin password
 * @access  Protected (Admin only)
 */
router.post('/change-password', verifyAdmin, authController.changePassword);

module.exports = router;
