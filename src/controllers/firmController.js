import Firm from '../models/Firm.js';
import { AppError } from '../middleware/errorHandler.js';

export const updateFirm = async (req, res, next) => {
  try {
    const { firmId } = req.user;
    const { name, reg_number, email, phone, address, type } = req.body;

    const firm = await Firm.findByPk(firmId);
    if (!firm) throw new AppError('Firm not found', 404);

    await firm.update({
      name,
      reg_number,
      email,
      phone,
      address,
      type
    });

    res.json({
      status: 'success',
      message: 'Firm updated successfully',
      data: firm
    });
  } catch (error) {
    next(error);
  }
};
