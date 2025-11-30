import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/enums.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createAppointment,
  listAppointments,
  getAppointment,
  updateAppointmentStatus,
  addVetNotes
} from '../controllers/appointmentController.js';
import {
  createAppointmentValidation,
  listAppointmentValidation,
  statusUpdateValidation,
  vetNotesValidation
} from '../validators/appointmentValidators.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize(USER_ROLES.FARMER, USER_ROLES.ADMIN),
  createAppointmentValidation,
  validateRequest,
  createAppointment
);

router.get(
  '/',
  protect,
  listAppointmentValidation,
  validateRequest,
  listAppointments
);

router.get('/:id', protect, getAppointment);

router.patch(
  '/:id/status',
  protect,
  statusUpdateValidation,
  validateRequest,
  updateAppointmentStatus
);

router.patch(
  '/:id/notes',
  protect,
  authorize(USER_ROLES.VET, USER_ROLES.ADMIN),
  vetNotesValidation,
  validateRequest,
  addVetNotes
);

export default router;

