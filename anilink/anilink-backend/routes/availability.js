import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/enums.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createAvailability,
  deleteAvailability,
  listAvailability,
  getOpenSlots
} from '../controllers/availabilityController.js';
import {
  createAvailabilityValidation,
  availabilityQueryValidation,
  openSlotsValidation
} from '../validators/availabilityValidators.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize(USER_ROLES.VET, USER_ROLES.ADMIN),
  createAvailabilityValidation,
  validateRequest,
  createAvailability
);

router.get(
  '/',
  availabilityQueryValidation,
  validateRequest,
  listAvailability
);

router.delete(
  '/:id',
  protect,
  authorize(USER_ROLES.VET, USER_ROLES.ADMIN),
  deleteAvailability
);

router.get(
  '/slots/open',
  openSlotsValidation,
  validateRequest,
  getOpenSlots
);

export default router;

