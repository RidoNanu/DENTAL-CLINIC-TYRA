const axios = require('axios');

// Get API Key from environment
const apiKey = process.env.BREVO_API_KEY;

// Startup log with masked key
if (apiKey) {
    const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`[MAILER] Brevo API Initialized. Key: ${maskedKey}`);
} else {
    console.error('[MAILER] ❌ FATAL: BREVO_API_KEY is missing. Emails will fail.');
}

/**
 * Send an email using Brevo Transactional Email API
 * @param {object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body (HTML)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!apiKey) {
            console.error('[MAILER] Cancelled send: BREVO_API_KEY is missing.');
            return false;
        }

        if (!to || !subject || !html) {
            console.error('[MAILER] Missing required fields (to, subject, or html).');
            return false;
        }

        // Normalize 'to' to an array of objects for Brevo
        const recipientList = Array.isArray(to) ? to : [to];
        const formattedTo = recipientList.map(email => ({ email }));

        console.log(`[MAILER] Sending via Brevo API to: ${recipientList.join(', ')} | Subject: ${subject}`);

        const payload = {
            sender: {
                name: "Tyra Dentistree",
                email: "no-reply@brevo.dev"
            },
            to: formattedTo,
            subject: subject,
            htmlContent: html
        };

        const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000 // 10s timeout
        });

        console.log(`[MAILER] Email sent successfully. MessageId: ${response.data.messageId}`);
        return true;

    } catch (error) {
        // Handle Axios errors gracefully
        const errorMsg = error.response?.data?.message || error.message;
        console.error(`[MAILER] Email failed: ${errorMsg}`);

        // Log full error details in non-production for debugging
        if (process.env.NODE_ENV !== 'production' && error.response) {
            console.error('[MAILER] Full Error Response:', JSON.stringify(error.response.data, null, 2));
        }

        return false;
    }
};

module.exports = { sendEmail };
