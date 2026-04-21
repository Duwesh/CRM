import { Contact, Client, TeamMember, Lead } from '../models/index.js';

// Contact Services
export const getAllContacts = async (firmId, page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;
  const { Op } = await import('sequelize');

  const whereClause = { is_deleted: false };
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { mobile: { [Op.iLike]: `%${search}%` } },
      { designation: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { rows: contacts, count: total } = await Contact.findAndCountAll({
    where: whereClause,
    include: [{
      model: Client,
      where: { firm_id: firmId, is_deleted: false },
      attributes: ['id', 'name']
    }],
    limit,
    offset,
    order: [['name', 'ASC']]
  });

  return { contacts, total, page, limit };
};

export const getContactsByClient = async (firmId, clientId) => {
  // Verify client belongs to firm
  const client = await Client.findOne({ 
    where: { id: clientId, firm_id: firmId, is_deleted: false },
    attributes: ['id']
  });
  if (!client) return null;

  return await Contact.findAll({ 
    where: { client_id: clientId, is_deleted: false },
    order: [['is_primary', 'DESC'], ['name', 'ASC']]
  });
};

export const createContact = async (clientId, data) => {
  return await Contact.create({
    ...data,
    client_id: clientId || data.client_id
  });
};

export const updateContact = async (contactId, data) => {
  const contact = await Contact.findByPk(contactId);
  if (!contact) return null;
  return await contact.update(data);
};

export const deleteContact = async (contactId) => {
  const contact = await Contact.findByPk(contactId);
  if (!contact) return null;
  return await contact.update({ is_deleted: true });
};

// Team Services
export const getTeamMembers = async (firmId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { rows: members, count: total } = await TeamMember.findAndCountAll({ 
    where: { firm_id: firmId, is_deleted: false },
    limit,
    offset,
    order: [['name', 'ASC']]
  });

  return { members, total, page, limit };
};

export const addTeamMember = async (firmId, data) => {
  return await TeamMember.create({
    ...data,
    firm_id: firmId
  });
};

export const updateTeamMember = async (id, firmId, data) => {
  const member = await TeamMember.findOne({
    where: { id, firm_id: firmId, is_deleted: false }
  });
  if (!member) throw new Error('Team member not found or unauthorized');
  return await member.update(data);
};

export const deleteTeamMember = async (id, firmId) => {
  const member = await TeamMember.findOne({
    where: { id, firm_id: firmId, is_deleted: false }
  });
  if (!member) throw new Error('Team member not found or unauthorized');
  return await member.update({ is_deleted: true });
};

// Lead Services
export const getAllLeads = async (firmId, page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;
  const { Op } = await import('sequelize');

  const whereClause = { firm_id: firmId, is_deleted: false };
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { contact_person: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { rows: leads, count: total } = await Lead.findAndCountAll({ 
    where: whereClause,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return { leads, total, page, limit };
};

export const updateLead = async (leadId, data) => {
  const lead = await Lead.findByPk(leadId);
  if (!lead) return null;
  return await lead.update(data);
};

export const deleteLead = async (leadId) => {
  const lead = await Lead.findByPk(leadId);
  if (!lead) return null;
  return await lead.update({ is_deleted: true });
};

export const createLead = async (firmId, data) => {
  return await Lead.create({
    ...data,
    firm_id: firmId,
    stage: data.stage || 'new'
  });
};

