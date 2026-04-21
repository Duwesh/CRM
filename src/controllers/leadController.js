import * as CRMService from '../services/crmServices.js';

export const listLeads = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await CRMService.getAllLeads(
      req.user.firmId,
      Number(page) || 1,
      Number(limit) || 100, // Increase limit for kanban or handle differently
      search
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const result = await CRMService.createLead(req.user.firmId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await CRMService.updateLead(id, req.body);
    if (!result) return res.status(404).json({ status: 'error', message: 'Lead not found' });
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await CRMService.deleteLead(id);
    if (!result) return res.status(404).json({ status: 'error', message: 'Lead not found' });
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

