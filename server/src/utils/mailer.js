const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend API
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.html - Email body (HTML)
 * @returns {Promise<boolean>} - True if sent successfully, false otherwise
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const result = await resend.emails.send({
            from: "Tyra Dentitree <onboarding@resend.dev>",
            to,
            subject,
            html,
        });

        console.log("EMAIL SENT:", result.id);
        return true;
    } catch (error) {
        console.error("EMAIL ERROR:", error);
        return false;
    }
};

module.exports = { sendEmail };
