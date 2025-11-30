import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  getOverviewStats,
  getRecentActivities,
  exportOrdersCSV,
  exportAppointmentsCSV
} from '../controllers/adminAnalyticsController.js';
import { exportDateRangeValidation } from '../validators/adminValidators.js';
import { USER_ROLES } from '../constants/enums.js';

const router = express.Router();

router.use(protect, authorize(USER_ROLES.ADMIN));

router.get('/overview', getOverviewStats);
router.get('/recent-activity', getRecentActivities);

router.get(
  '/exports/orders',
  exportDateRangeValidation,
  validateRequest,
  exportOrdersCSV
);

router.get(
  '/exports/appointments',
  exportDateRangeValidation,
  validateRequest,
  exportAppointmentsCSV
);

export default router;

