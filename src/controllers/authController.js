import * as AuthService from '../services/authService.js';

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

