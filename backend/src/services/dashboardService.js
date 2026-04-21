import { Op } from 'sequelize';
import { Client, Task, Lead, Deadline, Invoice, Interaction, TeamMember } from '../models/index.js';
import { sequelize } from '../config/db.js';

export const getDashboardStats = async (firmId) => {
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const todayStr = today.toISOString().split('T')[0];
  const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];

  const [
    totalClients, 
    prevMonthClients,
    activeTasksCount, 
    prevMonthTasks,
    activeLeads, 
    upcomingDeadlinesCount,
    outstandingSum,
    upcomingDeadlines,
    overdueInvoices,
    recentActivity
  ] = await Promise.all([
    Client.count({ where: { firm_id: firmId, is_deleted: false } }),
    Client.count({ where: { firm_id: firmId, is_deleted: false, created_at: { [Op.lt]: startOfMonth } } }),
    Task.count({ 
      where: { 
        firm_id: firmId, 
        status: { [Op.ne]: 'completed' },
        is_deleted: false 
      } 
    }),
    Task.count({ 
      where: { 
        firm_id: firmId, 
        status: { [Op.ne]: 'completed' },
        is_deleted: false,
        created_at: { [Op.lt]: startOfMonth }
      } 
    }),
    Lead.count({ 
      where: { 
        firm_id: firmId, 
        stage: { [Op.ne]: 'closed' },
        is_deleted: false 
      } 
    }),
    Deadline.count({ 
      where: { 
        firm_id: firmId, 
        is_deleted: false,
        due_date: { [Op.between]: [todayStr, thirtyDaysLaterStr] } 
      } 
    }),
    // Use join since firm_id is confirmed missing on Invoice in some environments
    Invoice.sum('amount', {
      include: [{ model: Client, where: { firm_id: firmId }, attributes: [] }],
      where: {
        status: { [Op.ne]: 'paid' },
        is_deleted: false
      }
    }),
    Deadline.findAll({
      where: { 
        firm_id: firmId, 
        is_deleted: false,
        due_date: { [Op.between]: [todayStr, thirtyDaysLaterStr] } 
      },
      include: [{ model: Client, attributes: ['name'] }],
      order: [['due_date', 'ASC']],
      limit: 5
    }),
    Invoice.findAll({
      include: [{ model: Client, where: { firm_id: firmId }, attributes: ['name'] }],
      where: {
        status: { [Op.ne]: 'paid' },
        due_date: { [Op.lt]: todayStr },
        is_deleted: false
      },
      order: [['due_date', 'ASC']],
      limit: 3
    }),
    Interaction.findAll({
      where: { is_deleted: false },
      include: [
        { model: Client, attributes: ['name'], where: { firm_id: firmId } },
        { model: TeamMember, attributes: ['name'] }
      ],
      order: [['interaction_date', 'DESC'], ['created_at', 'DESC']],
      limit: 3
    })
  ]);

  // Calculate dynamic changes
  const calculateChange = (current, previous) => {
    if (previous === 0) return { change: current > 0 ? '+100%' : '0%', isUp: current > 0 };
    const pct = ((current - previous) / previous) * 100;
    return { 
      change: `${pct >= 0 ? '+' : ''}${Math.abs(pct).toFixed(0)}%`, 
      isUp: pct >= 0 
    };
  };

  const clientStats = calculateChange(totalClients, prevMonthClients);
  const taskStats = calculateChange(activeTasksCount, prevMonthTasks);

  // Handle null sum
  const totalOutstanding = outstandingSum || 0;

  return {
    stats: {
      clients: totalClients,
      clientsChange: clientStats.change,
      clientsIsUp: clientStats.isUp,
      tasks: activeTasksCount,
      tasksChange: taskStats.change,
      tasksIsUp: taskStats.isUp,
      leads: activeLeads,
      deadlines: upcomingDeadlinesCount,
      revenue: `₹${new Intl.NumberFormat('en-IN').format(totalOutstanding)}`,
      revenueChange: "+24%", // Mocking for now
      revenueIsUp: true
    },
    upcomingDeadlines,
    overdueInvoices,
    recentActivity
  };
};


