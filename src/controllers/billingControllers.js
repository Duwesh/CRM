import * as BillingService from '../services/billingServices.js';

// Engagement Controllers
export const listEngagements = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await BillingService.getAllEngagements(
      req.user.firmId,
      Number(page) || 1,
      Number(limit) || 10
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createEngagement = async (req, res, next) => {
  try {
    const result = await BillingService.createEngagement(req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateEngagement = async (req, res, next) => {
  try {
    const result = await BillingService.updateEngagement(req.params.id, req.user.firmId, req.body);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteEngagement = async (req, res, next) => {
  try {
    await BillingService.deleteEngagement(req.params.id, req.user.firmId);
    res.json({ status: 'success', message: 'Engagement deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Deadline Controllers
export const listDeadlines = async (req, res, next) => {
  try {
    const { month, year, page, limit } = req.query;
    const result = await BillingService.getAllDeadlines(
      req.user.firmId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
      Number(page) || 1,
      Number(limit) || 10
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createDeadline = async (req, res, next) => {
  try {
    const result = await BillingService.createDeadline(req.user.firmId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateDeadline = async (req, res, next) => {
  try {
    const result = await BillingService.updateDeadline(req.params.id, req.user.firmId, req.body);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteDeadline = async (req, res, next) => {
  try {
    await BillingService.deleteDeadline(req.params.id, req.user.firmId);
    res.json({ status: 'success', message: 'Deadline deleted' });
  } catch (error) {
    next(error);
  }
};

// Invoice Controllers
export const listInvoices = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await BillingService.getAllInvoices(
      req.user.firmId,
      Number(page) || 1,
      Number(limit) || 10
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceStats = async (req, res, next) => {
  try {
    const result = await BillingService.getInvoiceStats(req.user.firmId);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const result = await BillingService.createInvoice(req.user.firmId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (req, res, next) => {
  try {
    const result = await BillingService.updateInvoice(req.params.id, req.user.firmId, req.body);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req, res, next) => {
  try {
    await BillingService.deleteInvoice(req.params.id, req.user.firmId);
    res.json({ status: 'success', message: 'Invoice deleted' });
  } catch (error) {
    next(error);
  }
};

// Fee Controllers
export const getFeeSummary = async (req, res, next) => {
  try {
    const { search } = req.query;
    const result = await BillingService.getFeeSummary(req.user.firmId, search || '');
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateClientFee = async (req, res, next) => {
  try {
    const result = await BillingService.updateClientFee(req.params.clientId, req.user.firmId, req.body.annual_fee);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

