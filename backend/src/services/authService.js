import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import {
  Firm,
  User,
  InvoiceSequence,
  PasswordResetToken,
  sequelize,
} from "../models/index.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendEmail } from "./emailService.js";
import { forgotPasswordTemplate } from "../emailTemplates/index.js";

export const registerFirm = async (data) => {
  const passwordHash = await bcrypt.hash(data.password, 12);

  console.log({ data });
  return await sequelize.transaction(async (t) => {
    // Create Firm
    const firm = await Firm.create(
      {
        name: data.firmName,
        type: data.firmType || null,
        email: data.email,
      },
      { transaction: t },
    );

    // Create sequence
    await InvoiceSequence.create({ firm_id: firm.id }, { transaction: t });

    // Create Owner
    const user = await User.create(
      {
        firm_id: firm.id,
        name: data.name,
        email: data.email,
        password_hash: passwordHash,
        role: "owner",
      },
      { transaction: t },
    );

    const tokens = generateTokens(user.id, firm.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firmId: firm.id,
      },
      ...tokens,
    };
  });
};

export const login = async (email, password) => {
  const user = await User.findOne({
    where: { email, is_deleted: false },
    include: [
      {
        model: Firm,
        attributes: ["name", "logo_url"],
      },
    ],
  });

  if (!user || !user.is_active) throw new AppError("Invalid credentials", 401);

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new AppError("Invalid credentials", 401);

  const tokens = generateTokens(user.id, user.firm_id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      firmId: user.firm_id,
    },
    firm: {
      name: user.Firm?.name,
      logo_url: user.Firm?.logo_url,
    },
    ...tokens,
  };
};

export const generateTokens = (userId, firmId, role) => {
  const accessToken = jwt.sign({ userId, firmId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(
    { userId, firmId, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN },
  );
  return { accessToken, refreshToken };
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({
    where: { email, is_deleted: false },
    attributes: ["id", "name"],
  });
  if (!user) return; // Silent return for security

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 3600000);

  await PasswordResetToken.upsert({
    user_id: user.id,
    token,
    expires_at: expiresAt,
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const { subject, html } = forgotPasswordTemplate(user.name, resetUrl);

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

export const resetPassword = async (token, newPassword) => {
  const resetToken = await PasswordResetToken.findOne({
    where: {
      token,
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!resetToken) throw new AppError("Invalid or expired reset token", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await sequelize.transaction(async (t) => {
    await User.update(
      { password_hash: passwordHash },
      { where: { id: resetToken.user_id }, transaction: t },
    );
    await PasswordResetToken.destroy({
      where: { token },
      transaction: t,
    });
  });
};

export const getUserInfo = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "role", "firm_id"],
    include: [
      {
        model: Firm,
        attributes: ["name", "logo_url", "type", "reg_number", "email", "phone", "address"],
      },
    ],
  });

  if (!user || user.is_deleted) throw new AppError("User not found", 404);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    firm: {
      id: user.firm_id,
      name: user.Firm?.name,
      logo_url: user.Firm?.logo_url,
      type: user.Firm?.type,
      reg_number: user.Firm?.reg_number,
      email: user.Firm?.email,
      phone: user.Firm?.phone,
      address: user.Firm?.address,
    },
  };
};
