import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  toggleProductStatus
} from '../controllers/productController.js';
import {
  productCreateValidation,
  productUpdateValidation,
  productListValidation
} from '../validators/productValidators.js';
import { USER_ROLES } from '../constants/enums.js';

const router = express.Router();

router.get('/', productListValidation, validateRequest, listProducts);
router.get('/:id', getProduct);

router.post(
  '/',
  protect,
  authorize(USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  productCreateValidation,
  validateRequest,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize(USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  productUpdateValidation,
  validateRequest,
  updateProduct
);

router.patch(
  '/:id/toggle',
  protect,
  authorize(USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  toggleProductStatus
);

export default router;

