import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/index.js";
import { AppError } from "./errorHandler.js";

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("No token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Verify user still exists and is active
    const user = await User.findOne({
      where: { id: decoded.userId, is_active: true },
      attributes: ["id", "firm_id", "role"],
    });

    if (!user) {
      throw new AppError("User not found or deactivated", 401);
    }

    req.user = {
      userId: user.id,
      firmId: user.firm_id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid or expired token", 401);
  }
};

// Role-based access guard
export const requireRole =
  (...roles) =>
  (_req, _res, next) => {
    if (!_req.user) throw new AppError("Not authenticated", 401);
    if (!roles.includes(_req.user.role)) {
      throw new AppError("Insufficient permissions", 403);
    }
    next();
  };
