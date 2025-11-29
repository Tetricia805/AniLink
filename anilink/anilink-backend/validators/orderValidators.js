import { body, query } from 'express-validator';
import { ORDER_STATUS, PAYMENT_STATUS, FULFILLMENT_STATUS, SHIPPING_METHODS } from '../constants/enums.js';

export const orderCreateValidation = [
  body('vendorId').notEmpty().isMongoId().withMessage('vendorId required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('items array required'),
  body('items.*.productId').isMongoId(),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('quantity must be >= 1'),
  body('shipping.method')
    .optional()
    .isIn(SHIPPING_METHODS)
    .withMessage('Invalid shipping method')
];

export const orderListValidation = [
  query('status')
    .optional()
    .isIn(Object.values(ORDER_STATUS)),
  query('vendor').optional().isMongoId()
];

export const orderStatusValidation = [
  body('status').optional().isIn(Object.values(ORDER_STATUS)),
  body('fulfillmentStatus')
    .optional()
    .isIn(Object.values(FULFILLMENT_STATUS))
];

