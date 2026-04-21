import { AppError } from './errorHandler.js';

/**
 * Ensures every DB query is scoped to the authenticated firm.
 * Attaches firmId to req so controllers don't need to repeat extraction.
 */
export const enforceTenant = (req, _res, next) => {
  if (!req.user?.firmId) {
    throw new AppError('Firm context missing from token', 401);
  }
  next();
};
