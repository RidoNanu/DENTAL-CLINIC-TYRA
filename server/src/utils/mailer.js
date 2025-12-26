const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send an email using Brevo SMTP
 * @param {object} options - { to, subject, html }
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!to || !subject || !html) {
            console.error('[MAILER] Missing required fields (to, subject, or html).');
            return false;
        }

        console.log(`[MAILER] Sending via Brevo SMTP to: ${to} | Subject: ${subject}`);

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Tyra Dentistree" <hajmola5105@gmail.com>',
            to,
            subject,
            html,
        });

        console.log(`[MAILER] Email sent successfully. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[MAILER] ❌ Email failed:', error.message);
        return false;
    }
};

module.exports = { sendEmail };
