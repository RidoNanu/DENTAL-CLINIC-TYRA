const Brevo = require('@getbrevo/brevo');

// Initialize API instance
const apiInstance = new Brevo.TransactionalEmailsApi();
const apiKey = process.env.BREVO_API_KEY;

// Configure API key if present
if (apiKey) {
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`[MAILER] Brevo API Initialized. Key: ${maskedKey}`);
} else {
    console.warn('[MAILER] ⚠️ BREVO_API_KEY is missing. Email sending will be skipped.');
}

/**
 * Send an email using Brevo Node.js SDK
 *With structured logging and fallback diagnostics.
 * @param {object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body (HTML)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        // Lazy initialization check
        if (!apiKey) {
            console.warn('[MAILER] ⚠️ Cancelled send: BREVO_API_KEY is missing.');
            return false;
        }

        // 1. Log Safe Payload
        const recipients = Array.isArray(to) ? to : [to];
        console.log('[MAILER] 📤 Payload:', JSON.stringify({
            to: recipients,
            subject: subject,
            hasHtml: !!html
        }, null, 2));

        // Prepare email data
        const emailData = new Brevo.SendSmtpEmail();
        emailData.sender = {
            name: "Tyra Dentistree",
            email: "ridonanu5105@gmail.com"
        };
        emailData.to = recipients.map(email => ({ email }));
        emailData.subject = subject;
        emailData.htmlContent = html;

        // Execute API call
        const response = await apiInstance.sendTransacEmail(emailData);

        // 2. Log Success
        if (response && response.messageId) {
            console.log('[MAILER] 🟢 Brevo Success:', {
                messageId: response.messageId
            });
            return true;
        } else {
            // Unexpected success response format
            console.log('[MAILER] 🟢 Brevo Success (Unexpected Format):', JSON.stringify(response, null, 2));
            return true;
        }

    } catch (error) {
        // 3. Structured Fallback Logs
        console.error('[MAILER] 🔴 Brevo Failure:', {
            message: error.message,
            statusCode: error.response ? error.response.statusCode : 'Unknown'
        });

        // Detailed API error info if available
        if (error.body) {
            console.error('[MAILER] ❌ Fatal Email Error:', JSON.stringify(error.body, null, 2));
        } else if (error.response && error.response.text) {
            console.error('[MAILER] ❌ Fatal Email Error:', error.response.text);
        }

        // 4. Trace in Development
        if (process.env.NODE_ENV !== 'production') {
            console.error('[MAILER] Stack Trace:', error.stack);
        }

        return false;
    }
};

module.exports = { sendEmail };
