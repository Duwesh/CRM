import cron from 'node-cron';
import { Op } from 'sequelize';
import { Reminder, Deadline, Firm, Client, User, TeamMember } from '../models/index.js';
import { sendEmail } from './emailService.js';
import { dailyReminderTemplate, deadlineAlertTemplate } from '../emailTemplates/index.js';

export const startCronJobs = () => {
  // Daily at 8:00 AM IST (2:30 AM UTC)
  cron.schedule('30 2 * * *', async () => {
    console.log('⏰ Running daily reminder cron job...');
    try {
      await sendDailyReminders();
      await sendDeadlineAlerts();
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

  console.log('✅ Cron jobs started');
};

const sendDailyReminders = async () => {
  const today = new Date().toISOString().split('T')[0];

  const reminders = await Reminder.findAll({
    where: {
      reminder_date: today,
      is_done: false,
      email_sent: false,
      is_deleted: false
    },
    include: [
      { model: Firm, attributes: ['name'] },
      { model: Client, attributes: ['name'] },
      { 
        model: TeamMember, 
        as: 'assignee',
        attributes: ['email', 'name'],
        where: { email: { [Op.ne]: null }, is_deleted: false }
      }
    ]
  });

  for (const reminder of reminders) {
    const { subject, html } = dailyReminderTemplate(reminder);
    
    await sendEmail({
      to: reminder.assignee.email,
      subject,
      html,
    });

    await reminder.update({ email_sent: true });
  }

  console.log(`📧 Sent ${reminders.length} reminder emails`);
};

const sendDeadlineAlerts = async () => {
  // Alert for deadlines due in 3 days
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const dateStr = threeDaysLater.toISOString().split('T')[0];

  const deadlines = await Deadline.findAll({
    where: {
      due_date: dateStr,
      status: 'pending',
      is_deleted: false
    },
    include: [
      { model: Firm, attributes: ['name'] },
      { model: Client, attributes: ['name'] }
    ]
  });

  for (const deadline of deadlines) {
    // Find owner(s) for this firm
    const owners = await User.findAll({
      where: { 
        firm_id: deadline.firm_id,
        role: 'owner',
        is_deleted: false
      },
      attributes: ['email', 'name']
    });

    for (const owner of owners) {
      const { subject, html } = deadlineAlertTemplate(deadline, owner.name);
      
      await sendEmail({
        to: owner.email,
        subject,
        html,
      });
    }
  }

  console.log(`⚠️ Sent alert emails for ${deadlines.length} deadlines`);
};
