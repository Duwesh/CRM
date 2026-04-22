import { supabaseAdmin } from "../config/db.js";
import { User } from "../models/index.js";
import { AppError } from "./errorHandler.js";

export const protect = async (req, _res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new AppError("No token provided", 401);

  const {
    data: { user: supabaseUser },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !supabaseUser) throw new AppError("Invalid or expired token", 401);

  const user = await User.findOne({
    where: { supabase_uid: supabaseUser.id, is_active: true },
    attributes: ["id", "firm_id", "role"],
  });

  if (!user) throw new AppError("User not found or deactivated", 401);

  req.user = {
    userId: user.id,
    firmId: user.firm_id,
    role: user.role,
  };

  next();
};

export const requireRole =
  (...roles) =>
  (_req, _res, next) => {
    if (!_req.user) throw new AppError("Not authenticated", 401);
    if (!roles.includes(_req.user.role)) {
      throw new AppError("Insufficient permissions", 403);
    }
    next();
  };
