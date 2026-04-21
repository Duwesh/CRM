export const dailyReminderTemplate = (reminder) => ({
  subject: `[${reminder.priority.toUpperCase()}] Reminder: ${reminder.reminder_text.substring(0, 50)}`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #6366f1;">FirmEdge Daily Reminder</h2>
      <p><strong>Hi ${reminder.assignee.name},</strong></p>
      <p>You have a <strong>${reminder.priority}</strong> priority reminder for today:</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0;">
        <p style="margin: 0; font-style: italic;">"${reminder.reminder_text}"</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Firm:</td>
          <td style="padding: 8px 0; font-weight: bold;">${reminder.Firm.name}</td>
        </tr>
        ${reminder.Client ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Client:</td>
          <td style="padding: 8px 0; font-weight: bold;">${reminder.Client.name}</td>
        </tr>` : ''}
      </table>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
      <p style="text-align: center;">
        <a href="#" style="color: #6366f1; text-decoration: none; font-weight: bold;">View in FirmEdge CRM</a>
      </p>
    </div>
  `
});
