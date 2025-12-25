/**
 * Settings Controller
 * 
 * Handles clinic settings and system configuration
 */

const supabase = require('../lib/supabaseClient');
const bcrypt = require('bcrypt');

/**
 * Get clinic settings
 * GET /api/v1/settings/clinic
 */
const getClinicSettings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('clinic_settings')
            .select('*')
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: data || {}
        });
    } catch (error) {
        console.error('[SETTINGS] Get clinic error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clinic settings'
        });
    }
};

/**
 * Update clinic settings
 * PUT /api/v1/settings/clinic
 */
const updateClinicSettings = async (req, res) => {
    try {
        const { clinic_name, phone, email, address, opening_hours, google_maps_url, instagram_url } = req.body;
        const adminId = req.user.admin_id;

        // Validate required fields
        if (!clinic_name || !phone || !email || !address || !opening_hours) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Get existing settings
        const { data: existing } = await supabase
            .from('clinic_settings')
            .select('id')
            .single();

        let result;

        if (existing) {
            // Update existing settings
            const { data, error } = await supabase
                .from('clinic_settings')
                .update({
                    clinic_name,
                    phone,
                    email,
                    address,
                    opening_hours,
                    google_maps_url: google_maps_url || null,
                    instagram_url: instagram_url || null,
                    updated_at: new Date().toISOString(),
                    updated_by: adminId
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Insert new settings
            const { data, error } = await supabase
                .from('clinic_settings')
                .insert({
                    clinic_name,
                    phone,
                    email,
                    address,
                    opening_hours,
                    google_maps_url: google_maps_url || null,
                    instagram_url: instagram_url || null,
                    updated_by: adminId
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.json({
            success: true,
            message: 'Clinic settings updated successfully',
            data: result
        });
    } catch (error) {
        console.error('[SETTINGS] Update clinic error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update clinic settings'
        });
    }
};

/**
 * Get notification settings
 * GET /api/v1/settings/notifications
 */
const getNotificationSettings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('clinic_settings')
            .select('email_notifications_enabled, send_request_email, send_confirmation_email, send_cancellation_email')
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: data || {
                email_notifications_enabled: true,
                send_request_email: true,
                send_confirmation_email: true,
                send_cancellation_email: true
            }
        });
    } catch (error) {
        console.error('[SETTINGS] Get notifications error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification settings'
        });
    }
};

/**
 * Update notification settings
 * PUT /api/v1/settings/notifications
 */
const updateNotificationSettings = async (req, res) => {
    try {
        const {
            email_notifications_enabled,
            send_request_email,
            send_confirmation_email,
            send_cancellation_email
        } = req.body;

        const adminId = req.user.admin_id;

        // Get existing settings
        const { data: existing } = await supabase
            .from('clinic_settings')
            .select('id')
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Clinic settings not found. Please set up clinic information first.'
            });
        }

        const { data, error } = await supabase
            .from('clinic_settings')
            .update({
                email_notifications_enabled: email_notifications_enabled ?? true,
                send_request_email: send_request_email ?? true,
                send_confirmation_email: send_confirmation_email ?? true,
                send_cancellation_email: send_cancellation_email ?? true,
                updated_at: new Date().toISOString(),
                updated_by: adminId
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            data
        });
    } catch (error) {
        console.error('[SETTINGS] Update notifications error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification settings'
        });
    }
};

/**
 * Get system information
 * GET /api/v1/settings/system-info
 */
const getSystemInfo = async (req, res) => {
    try {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        res.json({
            success: true,
            data: {
                appName: 'Tyra Dentistree Admin',
                environment: process.env.NODE_ENV || 'development',
                apiVersion: 'v1',
                uptime: `${hours}h ${minutes}m`,
                nodeVersion: process.version
            }
        });
    } catch (error) {
        console.error('[SETTINGS] Get system info error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system information'
        });
    }
};

module.exports = {
    getClinicSettings,
    updateClinicSettings,
    getNotificationSettings,
    updateNotificationSettings,
    getSystemInfo
};
