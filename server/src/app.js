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

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173', // Local development
    'http://localhost:3000', // Local development alternative
    process.env.FRONTEND_URL // Production frontend
].filter(Boolean); // Filter out undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            // Check if origin matches Vercel preview deployments (optional)
            if (origin.endsWith('.vercel.app')) {
                return callback(null, true);
            }

            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
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

// Debug routes
const debugRoutes = require('./routes/debug.routes');
app.use('/api/v1/debug', debugRoutes);

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
