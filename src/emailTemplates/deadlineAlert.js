export const deadlineAlertTemplate = (deadline, ownerName) => ({
  subject: `⚠️ Deadline in 3 days: ${deadline.title}`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #ef4444;">Deadline Alert</h2>
      <p>Hi ${ownerName},</p>
      <p>The following deadline is due in <strong>3 days</strong>:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Title</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${deadline.title}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Category</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${deadline.category || '-'}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Due Date</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; color: #ef4444; font-weight: bold;">${deadline.due_date}</td>
        </tr>
        ${deadline.Client ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Client</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${deadline.Client.name}</td>
        </tr>` : ''}
      </table>

      <p style="margin-top: 25px; font-size: 14px; color: #64748b;">
        Please ensure all necessary actions are completed before the due date.
      </p>
    </div>
  `
});
