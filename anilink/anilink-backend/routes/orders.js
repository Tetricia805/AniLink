import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  markOrderPaid
} from '../controllers/orderController.js';
import {
  orderCreateValidation,
  orderListValidation,
  orderStatusValidation
} from '../validators/orderValidators.js';
import { USER_ROLES } from '../constants/enums.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize(USER_ROLES.FARMER, USER_ROLES.ADMIN),
  orderCreateValidation,
  validateRequest,
  createOrder
);

router.get('/', protect, orderListValidation, validateRequest, listOrders);
router.get('/:id', protect, getOrder);

router.patch(
  '/:id/status',
  protect,
  authorize(USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  orderStatusValidation,
  validateRequest,
  updateOrderStatus
);

router.post(
  '/:id/payments/mark-paid',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.VENDOR),
  markOrderPaid
);

export default router;

