const nodemailer = require("nodemailer");

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );
}

function getTransporter() {
  if (!isSmtpConfigured()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

const sendVerificationEmail = async (email, token, appUrl = "http://localhost:5173") => {
  const verifyLink = `${appUrl}/verify-email?token=${token}`;

  if (!isSmtpConfigured()) {
    console.warn(`⚠️ [Email Service] SMTP not configured. Verification link for ${email}: ${verifyLink}`);
    return {
      success: false,
      configured: false,
      message: "Email service is not configured in .env. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.",
      verifyLink,
    };
  }

  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"BlockCert Verification" <no-reply@blockcert.io>',
      to: email,
      subject: "Verify your BlockCert Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 16px;">
          <h2 style="color: #6366f1;">Welcome to BlockCert Platform!</h2>
          <p>Please verify your email address to activate your account and start using the academic document verification platform.</p>
          <div style="margin: 25px 0;">
            <a href="${verifyLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Or copy and paste this link in your browser:<br/><a href="${verifyLink}" style="color: #818cf8;">${verifyLink}</a></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Verification email sent to ${email}: ${info.messageId}`);
    return { success: true, configured: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Email Service] Failed to send verification email to ${email}:`, err.message);
    return { success: false, configured: true, error: err.message };
  }
};

const sendAdminInvitationEmail = async (email, collegeName, token, appUrl = "http://localhost:5173") => {
  const setupLink = `${appUrl}/setup-password?token=${token}`;

  if (!isSmtpConfigured()) {
    console.warn(`⚠️ [Email Service] SMTP not configured. Admin Invitation link for ${email} (${collegeName}): ${setupLink}`);
    return {
      success: false,
      configured: false,
      message: "Email service is not configured in .env. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.",
      setupLink,
    };
  }

  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"BlockCert Platform" <no-reply@blockcert.io>',
      to: email,
      subject: `Invitation: College Administrator Access for ${collegeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 16px;">
          <h2 style="color: #10b981;">College Admin Account Created</h2>
          <p>You have been onboarded as a College Administrator for <strong>${collegeName}</strong> on the BlockCert platform.</p>
          <p>Click the link below to set your password and access your institution dashboard:</p>
          <div style="margin: 25px 0;">
            <a href="${setupLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
              Set Account Password
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Link: <a href="${setupLink}" style="color: #34d399;">${setupLink}</a></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Invitation email sent to ${email}: ${info.messageId}`);
    return { success: true, configured: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Email Service] Failed to send invitation to ${email}:`, err.message);
    return { success: false, configured: true, error: err.message };
  }
};

const sendPasswordResetEmail = async (email, token, appUrl = "http://localhost:5173") => {
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  if (!isSmtpConfigured()) {
    console.warn(`⚠️ [Email Service] SMTP not configured. Password Reset link for ${email}: ${resetLink}`);
    return {
      success: false,
      configured: false,
      message: "Email service is not configured in .env. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.",
      resetLink,
    };
  }

  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"BlockCert Security" <security@blockcert.io>',
      to: email,
      subject: "Password Reset Request for your BlockCert Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 16px;">
          <h2 style="color: #f43f5e;">Password Reset Request</h2>
          <p>We received a request to reset your BlockCert account password.</p>
          <p>Click below to choose a new password. This link will expire in 1 hour.</p>
          <div style="margin: 25px 0;">
            <a href="${resetLink}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Link: <a href="${resetLink}" style="color: #fb7185;">${resetLink}</a></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Password reset email sent to ${email}: ${info.messageId}`);
    return { success: true, configured: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Email Service] Failed to send password reset email to ${email}:`, err.message);
    return { success: false, configured: true, error: err.message };
  }
};

module.exports = {
  isSmtpConfigured,
  sendVerificationEmail,
  sendAdminInvitationEmail,
  sendPasswordResetEmail,
};
