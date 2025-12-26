const { Resend } = require('resend');

// Debug: Check API Key presence (Masked)
const apiKey = process.env.RESEND_API_KEY;
if (apiKey) {
    const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`[MAILER] Resend API Client Initialized. Key: ${maskedKey}`);
} else {
    console.error('[MAILER] ❌ FATAL: RESEND_API_KEY is missing from environment variables. Emails will fail.');
}

// Initialize Resend with the key (if present)
const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Send an email using Resend API
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.html - Email body (HTML)
 * @returns {Promise<boolean>} - True if sent successfully, false otherwise
 */
const sendEmail = async ({ to, subject, html }) => {
    // Fail fast if no key or client
    if (!apiKey || !resend) {
        console.error('[MAILER] Attempted to send email but RESEND_API_KEY is missing or invalid.');
        return false;
    }

    try {
        console.log(`[MAILER] 📧 Sending email to: ${to} | Subject: ${subject}`);

        const result = await resend.emails.send({
            from: "Tyra Dentistree <ridonanu5105@gmail.com>",
            to,
            subject,
            html,
        });

        if (result.error) {
            throw new Error(result.error.message || 'Unknown Resend API error');
        }

        console.log("[MAILER] ✅ Email sent successfully. ID:", result.data?.id || result.id);
        return true;
    } catch (error) {
        console.error("[MAILER] ❌ Email failed:", error.message);
        // Log stack trace only in development
        if (process.env.NODE_ENV !== 'production') {
            console.error(error);
        }
        return false;
    }
};

module.exports = { sendEmail };
