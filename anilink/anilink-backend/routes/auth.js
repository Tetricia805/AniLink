import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  forceLogoutAll
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  loginValidation,
  refreshValidation,
  registerValidation
} from '../validators/authValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post(
  '/register',
  authRateLimiter,
  registerValidation,
  validateRequest,
  register
);

router.post('/login', authRateLimiter, loginValidation, validateRequest, login);

router.post('/refresh', refreshValidation, validateRequest, refreshToken);

router.get('/me', protect, getMe);

router.post('/logout', protect, logout);

router.post('/logout-all', protect, forceLogoutAll);

export default router;
