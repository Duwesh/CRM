import * as CRMService from '../services/crmServices.js';

export const listTeamMembers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await CRMService.getTeamMembers(
      req.user.firmId,
      Number(page) || 1,
      Number(limit) || 10
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const addTeamMember = async (req, res, next) => {
  try {
    const result = await CRMService.addTeamMember(req.user.firmId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (req, res, next) => {
  try {
    const result = await CRMService.updateTeamMember(req.params.id, req.user.firmId, req.body);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (req, res, next) => {
  try {
    await CRMService.deleteTeamMember(req.params.id, req.user.firmId);
    res.json({ status: 'success', message: 'Team member deleted' });
  } catch (error) {
    next(error);
  }
};

