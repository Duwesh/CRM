import { Op } from 'sequelize';
import { Task, Document, Invoice, Deadline, Interaction, Client, TeamMember } from '../models/index.js';

const timeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const getNotifications = async (req, res) => {
  const { firmId } = req.user;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);
  const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];

  const [overdueTasks, recentDocs, paidInvoices, upcomingDeadlines, recentInteractions] =
    await Promise.all([
      Task.findAll({
        where: {
          firm_id: firmId,
          is_deleted: false,
          status: { [Op.notIn]: ['completed', 'done'] },
          due_date: { [Op.lt]: todayStr },
        },
        include: [{ model: Client, attributes: ['name'] }],
        order: [['due_date', 'ASC']],
        limit: 5,
      }),
      Document.findAll({
        where: {
          is_deleted: false,
          createdAt: { [Op.gte]: sevenDaysAgo },
        },
        include: [
          { model: Client, where: { firm_id: firmId }, attributes: ['name'] },
          { model: TeamMember, as: 'uploader', attributes: ['name'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
      Invoice.findAll({
        where: {
          firm_id: firmId,
          is_deleted: false,
          status: 'paid',
          updatedAt: { [Op.gte]: sevenDaysAgo },
        },
        include: [{ model: Client, attributes: ['name'] }],
        order: [['updatedAt', 'DESC']],
        limit: 5,
      }),
      Deadline.findAll({
        where: {
          firm_id: firmId,
          is_deleted: false,
          status: { [Op.notIn]: ['completed', 'done'] },
          due_date: { [Op.between]: [todayStr, threeDaysLaterStr] },
        },
        include: [{ model: Client, attributes: ['name'] }],
        order: [['due_date', 'ASC']],
        limit: 5,
      }),
      Interaction.findAll({
        where: {
          firm_id: firmId,
          is_deleted: false,
          createdAt: { [Op.gte]: sevenDaysAgo },
        },
        include: [{ model: Client, attributes: ['name'] }],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
    ]);

  const notifications = [];

  for (const task of overdueTasks) {
    const daysOverdue = Math.floor(
      (today - new Date(task.due_date)) / 86400000
    );
    const clientName = task.Client?.name || 'Unknown Client';
    notifications.push({
      id: `task_${task.id}`,
      type: 'overdue_task',
      title: 'Task Overdue',
      desc: `${task.description} for ${clientName} is overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}.`,
      icon: 'Clock',
      color: 'text-red',
      createdAt: task.updatedAt || task.createdAt,
    });
  }

  for (const doc of recentDocs) {
    const uploaderName = doc.uploader?.name || 'Someone';
    const clientName = doc.Client?.name || 'a client';
    notifications.push({
      id: `doc_${doc.id}`,
      type: 'new_document',
      title: 'New Document',
      desc: `${uploaderName} uploaded ${doc.name} for ${clientName}.`,
      icon: 'FileText',
      color: 'text-blue',
      createdAt: doc.createdAt,
    });
  }

  for (const inv of paidInvoices) {
    const clientName = inv.Client?.name || 'A client';
    const amount = new Intl.NumberFormat('en-IN').format(inv.amount);
    notifications.push({
      id: `inv_${inv.id}`,
      type: 'invoice_paid',
      title: 'Invoice Paid',
      desc: `${clientName} paid ${inv.invoice_number} (₹${amount}).`,
      icon: 'CheckSquare',
      color: 'text-green',
      createdAt: inv.updatedAt,
    });
  }

  for (const deadline of upcomingDeadlines) {
    const clientName = deadline.Client?.name;
    const daysLeft = Math.ceil(
      (new Date(deadline.due_date) - today) / 86400000
    );
    const daysText = daysLeft === 0 ? 'today' : `in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
    notifications.push({
      id: `deadline_${deadline.id}`,
      type: 'upcoming_deadline',
      title: 'Deadline Approaching',
      desc: `${deadline.title}${clientName ? ` for ${clientName}` : ''} is due ${daysText}.`,
      icon: 'Calendar',
      color: 'text-amber',
      createdAt: deadline.createdAt,
    });
  }

  for (const interaction of recentInteractions) {
    const clientName = interaction.Client?.name || 'a client';
    notifications.push({
      id: `int_${interaction.id}`,
      type: 'new_interaction',
      title: 'Client Interaction',
      desc: `New ${interaction.interaction_type || 'interaction'} logged for ${clientName}.`,
      icon: 'MessageSquare',
      color: 'text-amber',
      createdAt: interaction.createdAt,
    });
  }

  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const result = notifications.slice(0, 20).map((n) => ({
    ...n,
    time: timeAgo(n.createdAt),
  }));

  res.json({ status: 'success', data: { notifications: result, total: result.length } });
};
