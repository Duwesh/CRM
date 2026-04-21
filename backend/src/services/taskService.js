import { Task, Client, TeamMember } from '../models/index.js';

export const getTasks = async (firmId, status, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const where = { firm_id: firmId, is_deleted: false };
  
  if (status) {
    where.status = status;
  }

  const { rows: tasks, count: total } = await Task.findAndCountAll({
    where,
    include: [
      {
        model: Client,
        attributes: ['name']
      },
      {
        model: TeamMember,
        as: 'assignee',
        attributes: ['name']
      }
    ],
    limit,
    offset,
    order: [['due_date', 'ASC']]
  });

  return { tasks, total, page, limit };
};

export const createTask = async (firmId, data) => {
  return await Task.create({
    ...data,
    firm_id: firmId,
    status: data.status || 'pending'
  });
};

export const updateTask = async (firmId, taskId, data) => {
  const task = await Task.findOne({
    where: { id: taskId, firm_id: firmId, is_deleted: false }
  });

  if (!task) return null;

  return await task.update(data);
};

export const deleteTask = async (firmId, taskId) => {
  const [updatedCount] = await Task.update(
    { is_deleted: true },
    { where: { id: taskId, firm_id: firmId, is_deleted: false } }
  );
  return updatedCount > 0;
};

