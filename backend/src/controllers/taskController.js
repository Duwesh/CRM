import * as TaskService from '../services/taskService.js';
import { AppError } from '../middleware/errorHandler.js';

export const listTasks = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await TaskService.getTasks(
      req.user.firmId, 
      status,
      Number(page) || 1,
      Number(limit) || 10
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const result = await TaskService.createTask(req.user.firmId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const result = await TaskService.updateTask(req.user.firmId, req.params.id, req.body);
    if (!result) throw new AppError('Task not found', 404);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const success = await TaskService.deleteTask(req.user.firmId, req.params.id);
    if (!success) throw new AppError('Task not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

