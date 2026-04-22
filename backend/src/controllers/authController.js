import * as AuthService from '../services/authService.js';
import { supabaseAdmin } from '../config/db.js';
import { User } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password, name, firmName } = req.body;
    if (!email || !password || !name || !firmName)
      throw new AppError('All fields are required', 400);

    const result = await AuthService.signup({ email, password, name, firmName }, supabaseAdmin);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const result = await AuthService.registerFirm(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Firm registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json({
      status: 'success',
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await AuthService.forgotPassword(email);
    res.json({
      status: 'success',
      message: 'If an account exists with that email, a reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    res.json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.generateTokens(req.user.userId, req.user.firmId, req.user.role);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
export const syncUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('No token provided', 401);

    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !supabaseUser) throw new AppError('Invalid token', 401);

    const result = await AuthService.syncUser(supabaseUser.id);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const completeSetup = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('No token provided', 401);

    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !supabaseUser) throw new AppError('Invalid token', 401);

    const existing = await User.findOne({ where: { supabase_uid: supabaseUser.id } });
    if (existing) throw new AppError('Firm already set up', 400);

    const { firmName } = req.body;
    if (!firmName?.trim()) throw new AppError('Firm name is required', 400);

    const result = await AuthService.completeSetup(supabaseUser, firmName.trim());
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const result = await AuthService.getUserInfo(req.user.userId);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

