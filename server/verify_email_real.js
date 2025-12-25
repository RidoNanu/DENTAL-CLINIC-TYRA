
require('dotenv').config();
const emailService = require('./src/services/email.service');

async function testEmail() {
    console.log('--- TESTING REAL EMAIL DELIVERY ---');
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`SMTP_USER: ${process.env.SMTP_USER ? '***' : 'MISSING'}`);

    try {
        await emailService.sendAppointmentRequested(
            'Test Patient',
            process.env.SMTP_USER, // Send to self to avoid spamming randoms if user put real email
            new Date().toISOString(),
            'Teeth Whitening (Test)'
        );
        console.log('✅ Email trigger call completed.');
    } catch (error) {
        console.error('❌ Failed:', error);
    }
    console.log('-----------------------------------');
}

testEmail();
