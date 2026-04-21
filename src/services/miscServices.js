import { Interaction, Reminder, Document, Firm, InviteToken, TeamMember, Client } from '../models/index.js';
import { sendEmail } from './emailService.js';
import { env } from '../config/env.js';
import { inviteMemberTemplate } from '../emailTemplates/index.js';

// Interaction Services
export const getAllInteractions = async (firmId, page = 1, limit = 10, clientId = null) => {
  const where = { firm_id: firmId, is_deleted: false };
  if (clientId) where.client_id = clientId;
  const offset = (page - 1) * limit;

  const { rows, count } = await Interaction.findAndCountAll({
    where,
    include: [
      { model: Client, attributes: ['id', 'name'] },
      { model: TeamMember, attributes: ['id', 'name'], required: false },
    ],
    order: [['interaction_date', 'DESC']],
    limit,
    offset,
  });

  return { interactions: rows, total: count, page, limit };
};

export const getInteractionsByClient = async (clientId) => {
  return await Interaction.findAll({
    where: { client_id: clientId, is_deleted: false },
    include: [{
      model: TeamMember,
      attributes: ['name'],
      required: false,
    }],
    order: [['interaction_date', 'DESC']]
  });
};

export const createInteraction = async (data) => {
  return await Interaction.create(data);
};

export const updateInteraction = async (id, firmId, data) => {
  const interaction = await Interaction.findOne({ where: { id, firm_id: firmId, is_deleted: false } });
  if (!interaction) throw new Error('Interaction not found');
  return await interaction.update(data);
};

export const deleteInteraction = async (id, firmId) => {
  const interaction = await Interaction.findOne({ where: { id, firm_id: firmId, is_deleted: false } });
  if (!interaction) throw new Error('Interaction not found');
  return await interaction.update({ is_deleted: true });
};

// Reminder Services
export const getReminders = async (firmId, status, page = 1, limit = 10) => {
  const where = { firm_id: firmId, is_deleted: false };
  if (status) {
    where.is_done = (status === 'done');
  }
  const offset = (page - 1) * limit;

  const { rows, count } = await Reminder.findAndCountAll({
    where,
    include: [
      { model: Client, attributes: ['id', 'name'], required: false },
      { model: TeamMember, foreignKey: 'assigned_to', as: 'assignee', attributes: ['id', 'name'], required: false },
    ],
    order: [['reminder_date', 'ASC']],
    limit,
    offset,
  });

  return { reminders: rows, total: count, page, limit };
};

export const createReminder = async (data) => {
  return await Reminder.create(data);
};

export const updateReminder = async (id, firmId, data) => {
  const reminder = await Reminder.findOne({ where: { id, firm_id: firmId, is_deleted: false } });
  if (!reminder) throw new Error('Reminder not found');
  return await reminder.update(data);
};

export const deleteReminder = async (id, firmId) => {
  const reminder = await Reminder.findOne({ where: { id, firm_id: firmId, is_deleted: false } });
  if (!reminder) throw new Error('Reminder not found');
  return await reminder.update({ is_deleted: true });
};

export const toggleReminder = async (id, firmId) => {
  const reminder = await Reminder.findOne({ where: { id, firm_id: firmId, is_deleted: false } });
  if (!reminder) throw new Error('Reminder not found');
  return await reminder.update({ is_done: !reminder.is_done });
};

// Document Services
export const getDocumentsByClient = async (clientId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { rows: documents, count: total } = await Document.findAndCountAll({
    where: { client_id: clientId, is_deleted: false },
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return { documents, total, page, limit };
};

export const getAllDocuments = async (firmId, page = 1, limit = 10, search = '') => {
  const { Op } = await import('sequelize');
  const offset = (page - 1) * limit;

  const where = { is_deleted: false };
  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }

  const { rows: documents, count: total } = await Document.findAndCountAll({
    include: [{
      model: Client,
      where: { firm_id: firmId },
      attributes: ['name']
    }],
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return { documents, total, page, limit };
};

export const getDocumentCategories = async (firmId) => {
  const { sequelize } = await import('../config/db.js');
  
  const results = await Document.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('Document.id')), 'count']
    ],
    include: [{
      model: Client,
      where: { firm_id: firmId },
      attributes: []
    }],
    where: { is_deleted: false },
    group: ['category'],
    raw: true
  });

  return results.map(r => ({
    name: r.category || 'General',
    count: parseInt(r.count, 10),
    color: '#6366F1'
  }));
};

export const createDocument = async (data) => {
  return await Document.create(data);
};

export const updateDocument = async (id, firmId, data) => {
  const document = await Document.findOne({
    where: { id, is_deleted: false },
    include: [{
      model: Client,
      where: { firm_id: firmId },
      attributes: []
    }]
  });
  if (!document) throw new Error('Document not found or unauthorized');
  return await document.update(data);
};

export const deleteDocument = async (id, firmId) => {
  const document = await Document.findOne({
    where: { id, is_deleted: false },
    include: [{
      model: Client,
      where: { firm_id: firmId },
      attributes: []
    }]
  });
  if (!document) throw new Error('Document not found or unauthorized');
  return await document.update({ is_deleted: true });
};

// Setting Services
export const getFirmProfile = async (firmId) => {
  return await Firm.findByPk(firmId);
};

export const updateFirmProfile = async (firmId, data) => {
  const firm = await Firm.findByPk(firmId);
  if (!firm) return null;
  return await firm.update(data);
};

export const inviteMember = async (firmId, email) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await InviteToken.create({
    firm_id: firmId,
    email,
    expires_at: expiresAt
  });

  const firm = await Firm.findByPk(firmId);
  const inviteUrl = `${env.FRONTEND_URL}/register?invite=${invite.token}`;
  const { subject, html } = inviteMemberTemplate(firm.name, inviteUrl);
  
  await sendEmail({
    to: email,
    subject,
    html
  });
  
  return invite.token;
};

