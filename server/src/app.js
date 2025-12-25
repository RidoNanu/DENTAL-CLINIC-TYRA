/**
 * Express Application Configuration
 * 
 * Sets up middleware and routes.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const { requestLogger, errorLogger } = require('./middlewares/logger.middleware');
const { apiLimiter, bookingLimiter } = require('./middlewares/rateLimit.middleware');
const { specs, swaggerUi } = require('./config/swagger');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (before routes)
app.use(requestLogger);

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customSiteTitle: 'TYRA DENTISTREE API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
}));

// Health check endpoint (no rate limiting)
app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Public routes (no authentication or rate limiting)
const publicRoutes = require('./routes/v1/public.routes');
app.use('/api/v1/public', publicRoutes);

// Rate limiting for API routes (100 requests per 15 minutes)
app.use('/api/v1', apiLimiter);

// API Routes
const apiRoutes = require('./routes/v1');
app.use('/api/v1', apiRoutes);

// 404 handler
app.use(notFound);

// Error logging (before error handler)
app.use(errorLogger);

// Error handler (should be last)
app.use(errorHandler);

module.exports = app;
