const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/mailer');

/**
 * GET /api/v1/debug/test-email
 * Query Params: ?to=user@example.com (optional)
 */
router.get('/test-email', async (req, res) => {
    try {
        const to = req.query.to || 'ridonanu5105@gmail.com';
        console.log(`[DEBUG] Triggering test email to: ${to}`);

        const result = await sendEmail({
            to,
            subject: '🔍 Tyra Dentistree: Production Email Test',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1>Test Email from Production</h1>
                    <p>If you are reading this, the email pipeline is functioning correctly!</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
                    <p><strong>API Key Status:</strong> ${process.env.RESEND_API_KEY ? 'Present' : 'Missing'}</p>
                </div>
            `
        });

        if (result) {
            console.log('[DEBUG] Test email sent successfully.');
            return res.json({
                success: true,
                message: `Test email sent to ${to}`,
                timestamp: new Date().toISOString()
            });
        } else {
            console.error('[DEBUG] Test email failed (sendEmail returned false).');
            return res.status(500).json({
                success: false,
                message: 'Email sending failed. Check server logs for details.'
            });
        }
    } catch (error) {
        console.error('[DEBUG] Test email error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
