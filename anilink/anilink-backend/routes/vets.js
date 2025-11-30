import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  nearbyVetValidation,
  upsertVetProfileValidation,
  vetQueryValidation
} from '../validators/vetValidators.js';
import {
  listVets,
  upsertVetProfile,
  getVetById,
  nearbyVets,
  verifyVetProfile,
  getMyVetProfile
} from '../controllers/vetController.js';
import { USER_ROLES } from '../constants/enums.js';

const router = express.Router();

router.get('/', vetQueryValidation, validateRequest, listVets);
router.get('/nearby', nearbyVetValidation, validateRequest, nearbyVets);
router.get(
  '/me',
  protect,
  authorize(USER_ROLES.VET, USER_ROLES.ADMIN),
  getMyVetProfile
);
router.get('/:id', getVetById);

router.post(
  '/',
  protect,
  authorize(USER_ROLES.VET, USER_ROLES.ADMIN),
  upsertVetProfileValidation,
  validateRequest,
  upsertVetProfile
);

router.put(
  '/:id/status',
  protect,
  authorize(USER_ROLES.ADMIN),
  verifyVetProfile
);

export default router;

