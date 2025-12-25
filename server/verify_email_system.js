
const emailService = require('./src/services/email.service');

async function testEmail() {
    console.log('--- TESTING EMAIL NOTIFICATION SYSTEM ---');
    try {
        await emailService.sendAppointmentRequested(
            'Test Patient',
            'test@example.com',
            new Date().toISOString(),
            'Teeth Whitening'
        );
        console.log('✅ Appointment Requested Email logic execution complete.');
    } catch (error) {
        console.error('❌ Failed:', error);
    }
    console.log('-----------------------------------------');
}

testEmail();
