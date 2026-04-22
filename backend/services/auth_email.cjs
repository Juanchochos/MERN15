
function generateVerificationCode() {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendCodeEmail({ userEmail, code, subject, heading, body }) {
    require('dotenv').config();
    const { Resend } = require('resend');

    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
    from: 'Verification <verify@rickymetral.xyz>',
    to: userEmail,
    subject: subject,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${heading}</h2>
        <p>${body}</p>
        <h1 style="color: #4A90E2; letter-spacing: 5px;">${code}</h1>
        <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
      </div>
    `,
    text: `Your verification code is: ${code}` // Always include plain text
    });

    return result;
}

async function sendEmail(userEmail, code) {
    return sendCodeEmail({
        userEmail,
        code,
        subject: 'Your Dominoes Verification Code',
        heading: 'Login Verification',
        body: 'Your one-time passcode is below. It will expire in 5 minutes.'
    });
}

async function sendPasswordResetEmail(userEmail, code) {
    return sendCodeEmail({
        userEmail,
        code,
        subject: 'Your Dominoes Password Reset Code',
        heading: 'Password Reset Verification',
        body: 'Use this one-time code to verify your account ownership and reset your password. It will expire in 5 minutes.'
    });
}

module.exports = {
    generateVerificationCode,
    sendEmail,
    sendPasswordResetEmail
};
