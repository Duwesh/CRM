import * as DashboardService from '../services/dashboardService.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const result = await DashboardService.getDashboardStats(req.user.firmId);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

