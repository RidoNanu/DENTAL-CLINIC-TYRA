/**
 * Email Service
 * 
 * Handles sending transactional emails using Nodemailer.
 * Supports development mode (console log) if SMTP credentials are missing.
 */

const nodemailer = require('nodemailer');
const { generateActionToken } = require('../utils/tokenUtils');
const clinicSettingsService = require('./clinicSettings.service');

// Helper to determine if we can send real emails
const isMailConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

// Create transporter
const transporter = isMailConfigured ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
}) : null;

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 */
const sendEmail = async (to, subject, html) => {
    try {
        if (isMailConfigured && transporter) {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Tyra Dentistree" <noreply@tyradentistree.com>',
                to,
                subject,
                html,
            });
        }
        // Email sent (or skipped in dev mode without SMTP config)
    } catch (error) {
        // Log error but do NOT throw to prevent blocking the API response
        console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    }
};

/**
 * Format date and time for email display
 * @param {string|Date} date - Date to format
 * @returns {object} - Formatted date and time strings
 */
const formatAppointmentDateTime = (date) => {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    return { date: dateStr, time: timeStr };
};

/**
 * Helper: Fetch dynamic shift time range
 * @param {string} shift - 'morning' or 'evening'
 * @returns {Promise<string>} Formatted time range (e.g. "9:00 AM – 1:00 PM")
 */
const getShiftTimeRange = async (shift) => {
    if (!shift) return '';

    try {
        const settings = await clinicSettingsService.getSettings();
        if (!settings) return '';

        let start, end;
        if (shift === 'morning') {
            start = settings.morning_start_time;
            end = settings.morning_end_time;
        } else if (shift === 'evening') {
            start = settings.evening_start_time;
            end = settings.evening_end_time;
        } else {
            return '';
        }

        // Helper to format HH:MM:SS to 12h format
        const formatTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes));
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        return `${formatTime(start)} – ${formatTime(end)}`;
    } catch (error) {
        console.error('[EMAIL ERROR] Fetching timings:', error.message);
        return 'Timing to be confirmed';
    }
};

/**
 * Send Appointment Request Confirmation (to Patient)
 */
const sendAppointmentRequested = async (patientName, patientEmail, appointmentDate, serviceName, shift) => {
    const { date, time } = formatAppointmentDateTime(appointmentDate);

    // Fetch dynamic shift time
    const shiftTimeRange = await getShiftTimeRange(shift);
    const timeDisplay = shift ? `${shift.charAt(0).toUpperCase() + shift.slice(1)} Shift (${shiftTimeRange})` : time;

    const subject = `📅 Appointment Request Received | Tyra Dentistree`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 100%;">
                            <!-- Header with Brand -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #0ca4b5 0%, #0891a0 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Tyra Dentistree</h1>
                                    <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px; font-weight: 500;">Your Smile, Our Priority</p>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #0f172a; font-size: 22px; font-weight: 700;">Appointment Request Received</h2>
                                    
                                    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                                        Dear <strong>${patientName}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                                        Thank you for choosing Tyra Dentistree! We've received your appointment request and our team is reviewing it now.
                                    </p>
                                    
                                    <!-- Appointment Details Card -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 8px; margin: 24px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <p style="margin: 0 0 4px 0; color: #9a3412; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Appointment Details</p>
                                                
                                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 12px;">
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; color: #78350f; font-size: 13px; font-weight: 600;">📅 Date</p>
                                                            <p style="margin: 4px 0 0 0; color: #451a03; font-size: 15px; font-weight: 700;">${date}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; color: #78350f; font-size: 13px; font-weight: 600;">${shift ? '🌞 Shift' : '🕐 Time'}</p>
                                                            <p style="margin: 4px 0 0 0; color: #451a03; font-size: 15px; font-weight: 700;">${timeDisplay}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; color: #78350f; font-size: 13px; font-weight: 600;">🦷 Service</p>
                                                            <p style="margin: 4px 0 0 0; color: #451a03; font-size: 15px; font-weight: 700;">${serviceName || 'General Consultation'}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 12px 0 0 0;">
                                                            <table cellpadding="0" cellspacing="0" style="background-color: #fed7aa; border-radius: 6px; padding: 8px 16px;">
                                                                <tr>
                                                                    <td style="color: #9a3412; font-size: 14px; font-weight: 700;">⏳ Status: Pending Approval</td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 24px 0 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                                        Our team will review your request and send you a confirmation email shortly. If you have any questions, feel free to contact us.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer with Contact Info -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-align: center;">Best regards,</p>
                                    <p style="margin: 0 0 20px 0; color: #0ca4b5; font-size: 15px; font-weight: 700; text-align: center;">The Tyra Dentistree Team</p>
                                    
                                    <!-- Contact Information -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
                                        <tr>
                                            <td style="text-align: center;">
                                                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">📍 Our Clinic</p>
                                                <p style="margin: 0 0 12px 0; color: #475569; font-size: 14px; line-height: 1.5;">
                                                    Tyra Dentistree Dental Clinic<br>
                                                    <a href="https://share.google/FoIH3ypE8GKIGVz3g" target="_blank" style="color: #0ca4b5; text-decoration: none;">View Location on Google Maps</a>
                                                </p>
                                                <p style="margin: 0 0 4px 0; color: #475569; font-size: 14px;">
                                                    📞 <strong>+91 70059 06657</strong>
                                                </p>
                                                <p style="margin: 0; color: #475569; font-size: 14px;">
                                                    ✉️ <a href="mailto:tyradentistree@gmail.com" style="color: #0ca4b5; text-decoration: none;">tyradentistree@gmail.com</a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px; text-align: center;">This email was sent to ${patientEmail}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
    await sendEmail(patientEmail, subject, html);
};

/**
 * Send Appointment Confirmation (to Patient)
 */
const sendAppointmentConfirmed = async (patientName, patientEmail, appointmentDate, serviceName, appointmentId, shift, tokenNumber) => {
    const { date, time } = formatAppointmentDateTime(appointmentDate);

    // Fetch dynamic shift time
    const shiftTimeRange = await getShiftTimeRange(shift);
    const timeDisplay = shift ? `${shift.charAt(0).toUpperCase() + shift.slice(1)} Shift (${shiftTimeRange})` : time;
    const subject = `✅ Appointment Confirmed | ${date} | Tyra Dentistree`;

    // Generate secure cancel token
    let cancelToken;
    let cancelUrl = '#';

    try {
        if (appointmentId) {
            cancelToken = await generateActionToken(appointmentId, 'cancel');

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            cancelUrl = `${frontendUrl}/appointment/cancel?token=${cancelToken}`;
        }
    } catch (error) {
        console.error('[EMAIL] Failed to generate action token:', error.message);
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 100%;">
                            <!-- Header with Brand -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #0ca4b5 0%, #0891a0 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Tyra Dentistree</h1>
                                    <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px; font-weight: 500;">Your Smile, Our Priority</p>
                                </td>
                            </tr>
                            
                            <!-- Success Banner -->
                            <tr>
                                <td style="background-color: #f0fdf4; padding: 20px 30px; border-bottom: 3px solid #16a34a;">
                                    <table cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td style="text-align: center;">
                                                <p style="margin: 0; color: #166534; font-size: 18px; font-weight: 700;">✅ Your Appointment is Confirmed!</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                                        Dear <strong>${patientName}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                                        Great news! Your appointment at Tyra Dentistree has been confirmed. We look forward to welcoming you!
                                    </p>
                                    
                                    <!-- Appointment Details Card -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 8px; margin: 24px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <p style="margin: 0 0 4px 0; color: #15803d; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Appointment</p>
                                                
                                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 12px;">
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; color: #166534; font-size: 13px; font-weight: 600;">📅 Date</p>
                                                            <p style="margin: 4px 0 0 0; color: #14532d; font-size: 15px; font-weight: 700;">${date}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; color: #166534; font-size: 13px; font-weight: 600;">${shift ? '🌞 Shift' : '🕐 Time'}</p>
                                                            <p style="margin: 4px 0 0 0; color: #14532d; font-size: 15px; font-weight: 700;">${timeDisplay}</p>
                                                        </td>
                                                    </tr>
                                                    ${tokenNumber ? `
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; color: #166534; font-size: 13px; font-weight: 600;">🔢 Token Number</p>
                                                            <p style="margin: 4px 0 0 0; color: #7c3aed; font-size: 20px; font-weight: 800;">#${tokenNumber}</p>
                                                        </td>
                                                    </tr>
                                                    ` : ''}
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; color: #166534; font-size: 13px; font-weight: 600;">🦷 Service</p>
                                                            <p style="margin: 4px 0 0 0; color: #14532d; font-size: 15px; font-weight: 700;">${serviceName}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 12px 0 0 0;">
                                                            <table cellpadding="0" cellspacing="0" style="background-color: #bbf7d0; border-radius: 6px; padding: 8px 16px;">
                                                                <tr>
                                                                    <td style="color: #15803d; font-size: 14px; font-weight: 700;">✓ Status: Confirmed</td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- Cancel Button -->
                                    ${appointmentId ? `
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                                        <tr>
                                            <td style="padding: 0;">
                                                <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; font-weight: 600; text-align: center;">Need to cancel?</p>
                                                <table cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td style="text-align: center;">
                                                            <a href="${cancelUrl}" style="display: inline-block; text-decoration: none; background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 14px 32px;">
                                                                <span style="color: #dc2626; font-size: 15px; font-weight: 700;">❌ Cancel Appointment</span>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    ` : ''}
                                    
                                    <!-- Important Information -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; margin: 24px 0;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 700;">📋 Please Note:</p>
                                                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                                                    • Please arrive <strong>10 minutes early</strong> for registration<br>
                                                    • Bring a valid ID and insurance card (if applicable)<br>
                                                    • Contact us if you have any questions
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 24px 0 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                                        We're excited to see you soon! If you have any questions, please don't hesitate to contact us.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer with Contact Info -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-align: center;">See you soon!</p>
                                    <p style="margin: 0 0 20px 0; color: #0ca4b5; font-size: 15px; font-weight: 700; text-align: center;">The Tyra Dentistree Team</p>
                                    
                                    <!-- Contact Information -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
                                        <tr>
                                            <td style="text-align: center;">
                                                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">📍 Our Clinic</p>
                                                <p style="margin: 0 0 12px 0; color: #475569; font-size: 14px; line-height: 1.5;">
                                                    Tyra Dentistree Dental Clinic<br>
                                                    <a href="https://share.google/FoIH3ypE8GKIGVz3g" target="_blank" style="color: #0ca4b5; text-decoration: none;">View Location on Google Maps</a>
                                                </p>
                                                <p style="margin: 0 0 4px 0; color: #475569; font-size: 14px;">
                                                    📞 <strong>+91 70059 06657</strong>
                                                </p>
                                                <p style="margin: 0; color: #475569; font-size: 14px;">
                                                    ✉️ <a href="mailto:tyradentistree@gmail.com" style="color: #0ca4b5; text-decoration: none;">tyradentistree@gmail.com</a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px; text-align: center;">This email was sent to ${patientEmail}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
    await sendEmail(patientEmail, subject, html);
};

/**
 * Send Appointment Cancellation (to Patient)
 */
const sendAppointmentCancelled = async (patientName, patientEmail, appointmentDate, reason, shift) => {
    const { date, time } = formatAppointmentDateTime(appointmentDate);

    // Fetch dynamic shift time
    const shiftTimeRange = await getShiftTimeRange(shift);
    const timeDisplay = shift ? `${shift.charAt(0).toUpperCase() + shift.slice(1)} Shift (${shiftTimeRange})` : time;
    const subject = `❌ Appointment Cancelled | Tyra Dentistree`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 100%;">
                            <!-- Header with Brand -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #0ca4b5 0%, #0891a0 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Tyra Dentistree</h1>
                                    <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px; font-weight: 500;">Your Smile, Our Priority</p>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #0f172a; font-size: 22px; font-weight: 700;">Appointment Cancelled</h2>
                                    
                                    <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                                        Dear <strong>${patientName}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                                        This is to confirm that your appointment with Tyra Dentistree has been cancelled.
                                    </p>
                                    
                                    <!-- Cancelled Appointment Details Card -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 8px; margin: 24px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <p style="margin: 0 0 4px 0; color: #991b1b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Cancelled Appointment</p>
                                                
                                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 12px;">
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 600;">📅 Date</p>
                                                            <p style="margin: 4px 0 0 0; color: #7f1d1d; font-size: 15px; font-weight: 700; text-decoration: line-through;">${date}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 600;">${shift ? '🌞 Shift' : '🕐 Time'}</p>
                                                            <p style="margin: 4px 0 0 0; color: #7f1d1d; font-size: 15px; font-weight: 700; text-decoration: line-through;">${timeDisplay}</p>
                                                        </td>
                                                    </tr>
                                                    ${reason ? `
                                                    <tr>
                                                        <td style="padding: 12px 0 0 0;">
                                                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fee2e2; border-radius: 6px; padding: 12px 16px;">
                                                                <tr>
                                                                    <td>
                                                                        <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 600;">Reason:</p>
                                                                        <p style="margin: 4px 0 0 0; color: #7f1d1d; font-size: 14px;">${reason}</p>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    ` : ''}
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Contact Information Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin: 24px 0;">
                                        <tr>
                                            <td style="padding: 24px; text-align: center;">
                                                <p style="margin: 0 0 16px 0; color: #1e40af; font-size: 15px; font-weight: 600;">Need to Book Again?</p>
                                                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                                                    We'd love to see you! Contact us to schedule a new appointment.<br>
                                                    📞 <strong>+91 70059 06657</strong> or ✉️ <a href="mailto:tyradentistree@gmail.com" style="color: #0ca4b5; text-decoration: none;">tyradentistree@gmail.com</a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 24px 0 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                                        If you have any questions or concerns, please don't hesitate to reach out to us. We're here to help!
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer with Contact Info -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-align: center;">Best regards,</p>
                                    <p style="margin: 0 0 20px 0; color: #0ca4b5; font-size: 15px; font-weight: 700; text-align: center;">The Tyra Dentistree Team</p>
                                    
                                    <!-- Contact Information -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
                                        <tr>
                                            <td style="text-align: center;">
                                                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">📍 Our Clinic</p>
                                                <p style="margin: 0 0 12px 0; color: #475569; font-size: 14px; line-height: 1.5;">
                                                    Tyra Dentistree Dental Clinic<br>
                                                    <a href="https://share.google/FoIH3ypE8GKIGVz3g" target="_blank" style="color: #0ca4b5; text-decoration: none;">View Location on Google Maps</a>
                                                </p>
                                                <p style="margin: 0 0 4px 0; color: #475569; font-size: 14px;">
                                                    📞 <strong>+91 70059 06657</strong>
                                                </p>
                                                <p style="margin: 0; color: #475569; font-size: 14px;">
                                                    ✉️ <a href="mailto:tyradentistree@gmail.com" style="color: #0ca4b5; text-decoration: none;">tyradentistree@gmail.com</a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px; text-align: center;">This email was sent to ${patientEmail}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
    await sendEmail(patientEmail, subject, html);
};

module.exports = {
    sendAppointmentRequested,
    sendAppointmentConfirmed,
    sendAppointmentCancelled
};
