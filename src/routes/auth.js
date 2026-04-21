import { Router } from 'express';
import * as AuthController from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/auth/me
 * @desc    Get current user and firm info
 */
router.get('/me', protect, AuthController.getMe);

/**
 * @route   POST /api/auth/register
 * @desc    Initial firm registration (creates firm + sequence + owner)
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return tokens
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate reset token and send email
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Verify token and update password
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @route   POST /api/auth/refresh
 * @desc    Get new access token using refresh token
 */
router.post('/refresh', AuthController.refreshToken);

export default router;

