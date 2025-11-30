import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  changePasswordValidation,
  updateProfileValidation
} from '../validators/userValidators.js';
import {
  updateProfile,
  changePassword,
  uploadAvatar,
  adminUpdateStatus
} from '../controllers/userController.js';
import { USER_ROLES } from '../constants/enums.js';

const router = express.Router();

router.put(
  '/profile',
  protect,
  updateProfileValidation,
  validateRequest,
  updateProfile
);

router.patch(
  '/password',
  protect,
  changePasswordValidation,
  validateRequest,
  changePassword
);

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

router.patch(
  '/:userId/status',
  protect,
  authorize(USER_ROLES.ADMIN),
  adminUpdateStatus
);

export default router;

