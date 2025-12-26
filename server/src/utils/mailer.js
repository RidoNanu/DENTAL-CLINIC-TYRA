
// Check environment variable at startup
if (process.env.BREVO_API_KEY) {
    console.log('[MAILER] Brevo API Initialized');
} else {
    console.error('[MAILER] ❌ BREVO_API_KEY is missing in environment variables.');
}

const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.BREVO_API_KEY) {
            console.error("[MAILER] ❌ Cancelled send: BREVO_API_KEY is missing.");
            return false;
        }

        console.log('[MAILER] Sending via Brevo API →', to);

        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sender: { email: "ridonanu5105@gmail.com", name: "Tyra Dentistree" },
                to: [{ email: to }],
                subject,
                htmlContent: html
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("[MAILER] ❌ Brevo API error:", data);
            return false;
        }

        console.log("[MAILER] ✅ Email sent:", data.messageId || data);
        return true;

    } catch (err) {
        console.error("[MAILER] ❌ Email send exception:", err.message);
        return false;
    }
};

module.exports = { sendEmail };
