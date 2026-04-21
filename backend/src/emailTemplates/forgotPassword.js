export const forgotPasswordTemplate = (name, resetUrl) => ({
  subject: 'Reset your FirmEdge password',
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #6366f1;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password for your FirmEdge account.</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This link will expire in 1 hour.</p>
    </div>
  `
});
