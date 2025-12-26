const Brevo = require('@getbrevo/brevo');

// Initialize API instance
const apiInstance = new Brevo.TransactionalEmailsApi();
const apiKey = process.env.BREVO_API_KEY;

// Configure API key if present
if (apiKey) {
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    console.log('[MAILER] Brevo API Initialized');
} else {
    console.error('[MAILER] ❌ BREVO_API_KEY is missing in environment variables.');
}

/**
 * Send an email using Brevo Node.js SDK
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

        console.log("[MAILER] Sending via Brevo API:", to);

        const emailData = {
            sender: {
                name: "Tyra Dentistree",
                email: "ridonanu5105@gmail.com"
            },
            to: [{ email: to }],
            subject,
            htmlContent: html
        };

        const response = await apiInstance.sendTransacEmail(emailData);

        console.log("[MAILER] Brevo API response:", JSON.stringify(response, null, 2));
        return true;

    } catch (error) {
        console.error("[MAILER] Brevo API ERROR");

        if (error.response) {
            console.error(error.response.text);
        } else {
            console.error(error.message);
        }
        return false;
    }
};

module.exports = { sendEmail };
