import * as ClientService from '../services/clientService.js';
import { AppError } from '../middleware/errorHandler.js';

export const listClients = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await ClientService.getClients(
      req.user.firmId,
      Number(page) || 1,
      Number(limit) || 10,
      search
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req, res, next) => {
  try {
    const result = await ClientService.createClient(req.user.firmId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getClient = async (req, res, next) => {
  try {
    const result = await ClientService.getClientById(req.user.firmId, req.params.id);
    if (!result) throw new AppError('Client not found', 404);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const result = await ClientService.updateClient(req.user.firmId, req.params.id, req.body);
    if (!result) throw new AppError('Client not found', 404);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const success = await ClientService.deleteClient(req.user.firmId, req.params.id);
    if (!success) throw new AppError('Client not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getClientStats = async (req, res, next) => {
  try {
    const result = await ClientService.getClientStats(req.user.firmId);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

