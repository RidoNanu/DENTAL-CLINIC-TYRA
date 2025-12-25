/**
 * Authentication Service
 * 
 * Handles admin authentication, password hashing, and JWT token generation.
 * Production-ready implementation with bcrypt and JWT.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabaseClient');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '30m'; // 30 minutes

/**
 * Hash a plain text password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verify a password against a bcrypt hash
 * @param {string} password - Plain text password
 * @param {string} hash - Bcrypt hash
 * @returns {Promise<boolean>} - True if password matches
 */
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token for an admin
 * @param {Object} admin - Admin object with id and email
 * @returns {string} - Signed JWT token
 */
const generateToken = (admin) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    const payload = {
        admin_id: admin.id,
        email: admin.email
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
        issuer: 'tyra-dentistree'
    });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'tyra-dentistree'
        });
    } catch (error) {
        return null;
    }
};

/**
 * Find an admin by email
 * @param {string} email - Admin email
 * @returns {Promise<Object|null>} - Admin object or null
 */
const findAdminByEmail = async (email) => {
    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

    if (error || !data) {
        return null;
    }

    return data;
};

/**
 * Authenticate admin with email and password
 * @param {string} email - Admin email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} - { success, token, admin } or { success: false, message }
 */
const login = async (email, password) => {
    // Find admin by email
    const admin = await findAdminByEmail(email);

    if (!admin) {
        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, admin.password_hash);

    if (!isValidPassword) {
        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

    // Generate JWT token
    const token = generateToken(admin);

    return {
        success: true,
        token,
        admin: {
            id: admin.id,
            email: admin.email
        }
    };
};

/**
 * Get admin by ID
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object|null>} - Admin object or null
 */
const getAdminById = async (adminId) => {
    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', adminId)
        .single();

    if (error || !data) {
        return null;
    }

    return data;
};

/**
 * Update admin password
 * @param {string} adminId - Admin ID
 * @param {string} hashedPassword - New hashed password
 * @returns {Promise<boolean>} - True if successful
 */
const updateAdminPassword = async (adminId, hashedPassword) => {
    const { error } = await supabase
        .from('admins')
        .update({ password_hash: hashedPassword })
        .eq('id', adminId);

    return !error;
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    findAdminByEmail,
    getAdminById,
    updateAdminPassword,
    login
};
