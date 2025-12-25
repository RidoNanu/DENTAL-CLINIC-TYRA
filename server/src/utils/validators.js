/**
 * Input Validation Utilities
 * 
 * Provides strict validation functions for controllers.
 * Throws ApiError(400) on validation failure.
 * No external libraries - explicit and readable.
 */

const ApiError = require('./apiError');

/**
 * Regular expressions for validation
 */
const REGEX = {
    // UUID v4 format
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

    // Email format (RFC 5322 simplified)
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

    // Phone number (digits only, 10-15 length)
    PHONE: /^\d{10,15}$/,

    // ISO 8601 timestamp
    ISO_TIMESTAMP: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/,
};

/**
 * Validate UUID format
 * @param {string} value - UUID to validate
 * @param {string} fieldName - Name of field for error message
 * @throws {ApiError} 400 if invalid
 */
const validateUUID = (value, fieldName = 'ID') => {
    if (!value || typeof value !== 'string') {
        throw ApiError.badRequest(`${fieldName} is required`);
    }

    if (!REGEX.UUID.test(value)) {
        throw ApiError.badRequest(`Invalid ${fieldName} format`);
    }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {ApiError} 400 if invalid
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        throw ApiError.badRequest('Email is required');
    }

    if (!REGEX.EMAIL.test(email)) {
        throw ApiError.badRequest('Invalid email format');
    }
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @throws {ApiError} 400 if invalid
 */
const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') {
        throw ApiError.badRequest('Phone number is required');
    }

    // Remove common formatting characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (!REGEX.PHONE.test(cleanPhone)) {
        throw ApiError.badRequest('Phone number must be 10-15 digits');
    }
};

/**
 * Validate required string field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of field for error message
 * @throws {ApiError} 400 if invalid
 */
const validateRequired = (value, fieldName) => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
        throw ApiError.badRequest(`${fieldName} is required`);
    }
};

/**
 * Validate ISO timestamp and ensure it's in the future
 * @param {string} timestamp - ISO timestamp to validate
 * @param {boolean} requireFuture - Whether to require future date
 * @throws {ApiError} 400 if invalid
 */
const validateTimestamp = (timestamp, requireFuture = false) => {
    if (!timestamp || typeof timestamp !== 'string') {
        throw ApiError.badRequest('Timestamp is required');
    }

    if (!REGEX.ISO_TIMESTAMP.test(timestamp)) {
        throw ApiError.badRequest('Invalid timestamp format (use ISO 8601)');
    }

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
        throw ApiError.badRequest('Invalid timestamp value');
    }

    if (requireFuture && date <= new Date()) {
        throw ApiError.badRequest('Appointment time must be in the future');
    }
};

/**
 * Validate enum value
 * @param {string} value - Value to validate
 * @param {string[]} allowedValues - Array of allowed values
 * @param {string} fieldName - Name of field for error message
 * @throws {ApiError} 400 if invalid
 */
const validateEnum = (value, allowedValues, fieldName) => {
    if (!value) {
        throw ApiError.badRequest(`${fieldName} is required`);
    }

    if (!allowedValues.includes(value)) {
        throw ApiError.badRequest(
            `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`
        );
    }
};

/**
 * Validate positive number
 * @param {number} value - Number to validate
 * @param {string} fieldName - Name of field for error message
 * @throws {ApiError} 400 if invalid
 */
const validatePositiveNumber = (value, fieldName) => {
    if (value === undefined || value === null) {
        throw ApiError.badRequest(`${fieldName} is required`);
    }

    const num = Number(value);

    if (isNaN(num) || num <= 0) {
        throw ApiError.badRequest(`${fieldName} must be a positive number`);
    }
};

module.exports = {
    validateUUID,
    validateEmail,
    validatePhone,
    validateRequired,
    validateTimestamp,
    validateEnum,
    validatePositiveNumber,
};
