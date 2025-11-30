import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  symptomCheck,
  fmdRiskCheck
} from '../controllers/aiController.js';
import {
  symptomCheckValidation,
  fmdRiskValidation
} from '../validators/aiValidators.js';

const router = express.Router();

router.post(
  '/symptom-checker',
  protect,
  symptomCheckValidation,
  validateRequest,
  symptomCheck
);

router.post(
  '/fmd-risk',
  protect,
  fmdRiskValidation,
  validateRequest,
  fmdRiskCheck
);

export default router;

