
function generateVerificationCode() {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(userEmail, code) {
    require('dotenv').config();
    const { Resend } = require('resend');

    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
    from: 'Verification <verify@rickymetral.xyz>',
    to: userEmail,
    subject: 'Your Dominoes Verification Code',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Login Verification</h2>
        <p>Your one-time passocode is below. It will expire in 5 minutes.</p>
        <h1 style="color: #4A90E2; letter-spacing: 5px;">${code}</h1>
        <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
      </div>
    `,
    text: `Your verification code is: ${code}` // Always include plain text
    });

    return result;
}

module.exports = {
    generateVerificationCode,
    sendEmail
};
