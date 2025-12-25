/**
 * Swagger/OpenAPI Configuration
 * 
 * Sets up API documentation using swagger-jsdoc and swagger-ui-express
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TYRA DENTISTREE API',
            version: '1.0.0',
            description: 'Dental Clinic Management System REST API Documentation',
            contact: {
                name: 'TYRA DENTISTREE',
                email: 'admin@tyradentistree.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001/api/v1',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your Supabase JWT token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
                Patient: {
                    type: 'object',
                    required: ['name', 'email', 'phone'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-42d3-a456-426614174000',
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com',
                        },
                        phone: {
                            type: 'string',
                            example: '1234567890',
                        },
                        date_of_birth: {
                            type: 'string',
                            format: 'date-time',
                            example: '1990-01-15T00:00:00Z',
                        },
                        gender: {
                            type: 'string',
                            enum: ['male', 'female', 'other'],
                            example: 'male',
                        },
                        address: {
                            type: 'string',
                            example: '123 Main St, City, State 12345',
                        },
                        medical_history: {
                            type: 'string',
                            example: 'No known allergies',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Service: {
                    type: 'object',
                    required: ['name', 'description', 'price', 'duration'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        name: {
                            type: 'string',
                            example: 'Dental Cleaning',
                        },
                        description: {
                            type: 'string',
                            example: 'Professional teeth cleaning service',
                        },
                        price: {
                            type: 'number',
                            format: 'float',
                            example: 100.00,
                        },
                        duration: {
                            type: 'integer',
                            description: 'Duration in minutes',
                            example: 30,
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Appointment: {
                    type: 'object',
                    required: ['patient_id', 'service_id', 'appointment_at'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        patient_id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        service_id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        appointment_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-12-25T10:00:00Z',
                        },
                        end_time: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Auto-calculated based on service duration',
                            example: '2025-12-25T10:30:00Z',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
                            example: 'pending',
                        },
                        notes: {
                            type: 'string',
                            example: 'First visit',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Health',
                description: 'Server health check',
            },
            {
                name: 'Patients',
                description: 'Patient management endpoints (Admin only)',
            },
            {
                name: 'Services',
                description: 'Dental service management endpoints',
            },
            {
                name: 'Appointments',
                description: 'Appointment management endpoints (Admin only)',
            },
        ],
    },
    apis: ['./src/swagger/*.yaml'], // Path to API documentation files
};

const specs = swaggerJsdoc(options);

module.exports = {
    specs,
    swaggerUi,
};
