export const inviteMemberTemplate = (firmName, inviteUrl) => ({
  subject: `Join ${firmName} on FirmEdge`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #6366f1;">Welcome to FirmEdge</h2>
      <p>Hello,</p>
      <p>You have been invited to join <strong>${firmName}</strong> on the FirmEdge CRM platform.</p>
      
      <div style="margin: 30px 0;">
        <a href="${inviteUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation & Register</a>
      </div>

      <p>FirmEdge helps you manage clients, tasks, and billing all in one place.</p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This invitation link will expire in 7 days.</p>
    </div>
  `
});
