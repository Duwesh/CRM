import * as CRMService from '../services/crmServices.js';
import { AppError } from '../middleware/errorHandler.js';

export const listAllContacts = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await CRMService.getAllContacts(req.user.firmId, Number(page) || 1, Number(limit) || 10, search);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const listContacts = async (req, res, next) => {
  try {
    const result = await CRMService.getContactsByClient(req.user.firmId, req.params.clientId);
    if (result === null) throw new AppError('Client not found or access denied', 404);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const result = await CRMService.createContact(req.params.clientId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const result = await CRMService.updateContact(req.params.id, req.body);
    if (!result) throw new AppError('Contact not found', 404);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const result = await CRMService.deleteContact(req.params.id);
    if (!result) throw new AppError('Contact not found', 404);
    res.json({ status: 'success', data: { message: 'Contact deleted successfully' } });
  } catch (error) {
    next(error);
  }
};
