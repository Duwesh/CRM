import { Op } from 'sequelize';
import { Engagement, Client, Deadline, Invoice, InvoiceSequence, Firm, sequelize } from '../models/index.js';
import { generateInvoicePDF } from './pdfService.js';
import { supabase } from '../config/supabase.js';

const uploadPDFToSupabase = async (buffer, filename) => {
  const { data, error } = await supabase.storage
    .from('firmedge')
    .upload(`invoices/${filename}.pdf`, buffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('firmedge')
    .getPublicUrl(`invoices/${filename}.pdf`);

  return publicUrl;
};

// Fee Summary methods
export const getFeeSummary = async (firmId, search = '') => {
  const where = { firm_id: firmId, is_deleted: false, status: 'active' };
  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }

  const clients = await Client.findAll({
    where,
    attributes: ['id', 'name', 'annual_fee'],
    order: [['name', 'ASC']]
  });

  if (clients.length === 0) return { clients: [] };

  const clientIds = clients.map(c => c.id);

  const invoiceAggregates = await Invoice.findAll({
    where: { firm_id: firmId, is_deleted: false, client_id: { [Op.in]: clientIds } },
    attributes: [
      'client_id',
      [sequelize.fn('SUM', sequelize.col('amount')), 'invoiced'],
      [sequelize.fn('SUM', sequelize.col('amount_received')), 'collected'],
    ],
    group: ['client_id']
  });

  const aggMap = {};
  invoiceAggregates.forEach(a => {
    aggMap[a.client_id] = {
      invoiced: parseFloat(a.dataValues.invoiced) || 0,
      collected: parseFloat(a.dataValues.collected) || 0,
    };
  });

  const result = clients.map(c => {
    const agg = aggMap[c.id] || { invoiced: 0, collected: 0 };
    const annual_fee = parseFloat(c.annual_fee) || 0;
    const outstanding = agg.invoiced - agg.collected;
    const pct = agg.invoiced > 0 ? Math.round((agg.collected / agg.invoiced) * 100) : 0;
    return { id: c.id, name: c.name, annual_fee, invoiced: agg.invoiced, collected: agg.collected, outstanding, pct_collected: pct };
  });

  return { clients: result };
};

export const updateClientFee = async (clientId, firmId, annual_fee) => {
  const client = await Client.findOne({ where: { id: clientId, firm_id: firmId, is_deleted: false } });
  if (!client) throw new Error('Client not found or unauthorized');
  return await client.update({ annual_fee });
};

// Engagement methods
export const getAllEngagements = async (firmId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { rows: engagements, count: total } = await Engagement.findAndCountAll({
    where: { is_deleted: false },
    include: [{
      model: Client,
      where: { firm_id: firmId, is_deleted: false },
      attributes: ['name']
    }],
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return { engagements, total, page, limit };
};

export const createEngagement = async (data) => {
  return await Engagement.create(data);
};

export const updateEngagement = async (id, firmId, data) => {
  const engagement = await Engagement.findOne({
    where: { id, is_deleted: false },
    include: [{
      model: Client,
      where: { firm_id: firmId, is_deleted: false },
      attributes: []
    }]
  });

  if (!engagement) {
    throw new Error('Engagement not found or unauthorized');
  }

  return await engagement.update(data);
};

export const deleteEngagement = async (id, firmId) => {
  const engagement = await Engagement.findOne({
    where: { id, is_deleted: false },
    include: [{
      model: Client,
      where: { firm_id: firmId, is_deleted: false },
      attributes: []
    }]
  });

  if (!engagement) {
    throw new Error('Engagement not found or unauthorized');
  }

  return await engagement.update({ is_deleted: true });
};

// Deadline methods
export const getAllDeadlines = async (firmId, month, year, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const where = { firm_id: firmId, is_deleted: false };

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    where.due_date = {
      [Op.between]: [startDate, endDate]
    };
  }

  const { rows: deadlines, count: total } = await Deadline.findAndCountAll({
    where,
    include: [{
      model: Client,
      where: { is_deleted: false },
      attributes: ['name']
    }],
    limit,
    offset,
    order: [['due_date', 'ASC']]
  });

  return { deadlines, total, page, limit };
};

export const createDeadline = async (firmId, data) => {
  return await Deadline.create({
    ...data,
    firm_id: firmId
  });
};

export const updateDeadline = async (id, firmId, data) => {
  const deadline = await Deadline.findOne({
    where: { id, firm_id: firmId, is_deleted: false }
  });
  if (!deadline) throw new Error('Deadline not found or unauthorized');
  return await deadline.update(data);
};

export const deleteDeadline = async (id, firmId) => {
  const deadline = await Deadline.findOne({
    where: { id, firm_id: firmId, is_deleted: false }
  });
  if (!deadline) throw new Error('Deadline not found or unauthorized');
  return await deadline.update({ is_deleted: true });
};

// Invoice methods
export const getAllInvoices = async (firmId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { rows: invoices, count: total } = await Invoice.findAndCountAll({
    where: { is_deleted: false },
    include: [{
      model: Client,
      where: { firm_id: firmId, is_deleted: false },
      attributes: ['name']
    }],
    limit,
    offset,
    order: [['invoice_date', 'DESC']]
  });

  return { invoices, total, page, limit };
};

export const getInvoiceStats = async (firmId) => {
  const invoices = await Invoice.findAll({
    where: { is_deleted: false },
    include: [{
      model: Client,
      where: { firm_id: firmId, is_deleted: false },
      attributes: [],
    }],
    attributes: ['status', 'amount', 'amount_received'],
  });

  let total = invoices.length;
  let collected = 0;
  let outstanding = 0;
  let overdue = 0;

  for (const inv of invoices) {
    const amount = Number(inv.amount) || 0;
    const received = Number(inv.amount_received) || 0;
    if (inv.status === 'paid') {
      collected += amount;
    } else {
      outstanding += amount - received;
      if (inv.status === 'overdue') overdue++;
    }
  }

  return { total, collected, outstanding, overdue };
};

export const createInvoice = async (firmId, data) => {
  return await sequelize.transaction(async (t) => {
    // Get and update sequence
    const sequence = await InvoiceSequence.findOne({
      where: { firm_id: firmId },
      transaction: t,
      lock: true
    });

    if (!sequence) {
      throw new Error('Invoice sequence not found for firm');
    }

    sequence.last_number += 1;
    await sequence.save({ transaction: t });

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(sequence.last_number).padStart(4, '0')}`;

    // Create invoice
    const invoice = await Invoice.create({
      ...data,
      firm_id: firmId,
      invoice_number: invoiceNumber,
      status: data.status || 'unpaid'
    }, { transaction: t });

    // Get info for PDF
    const clientInfo = await Client.findOne({ 
      where: { id: data.client_id, is_deleted: false }, 
      transaction: t 
    });
    const firmInfo = await Firm.findByPk(firmId, { transaction: t });
    
    const pdfBuffer = await generateInvoicePDF({
      ...invoice.toJSON(),
      client: clientInfo.toJSON(),
      firm: firmInfo.toJSON()
    });

    const pdfUrl = await uploadPDFToSupabase(pdfBuffer, invoiceNumber);
    await invoice.update({ pdf_url: pdfUrl }, { transaction: t });

    return invoice;
  });
};

export const updateInvoice = async (id, firmId, data) => {
  const invoice = await Invoice.findOne({
    where: { id, is_deleted: false },
    include: [{ model: Client, where: { firm_id: firmId }, attributes: [] }]
  });
  if (!invoice) throw new Error('Invoice not found or unauthorized');
  return await invoice.update(data);
};

export const deleteInvoice = async (id, firmId) => {
  const invoice = await Invoice.findOne({
    where: { id, is_deleted: false },
    include: [{ model: Client, where: { firm_id: firmId }, attributes: [] }]
  });
  if (!invoice) throw new Error('Invoice not found or unauthorized');
  return await invoice.update({ is_deleted: true });
};

