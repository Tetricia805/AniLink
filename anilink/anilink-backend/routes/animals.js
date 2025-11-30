import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createAnimal,
  listAnimals,
  getAnimal,
  updateAnimal,
  deleteAnimal
} from '../controllers/animalController.js';
import {
  animalCreateValidation,
  animalUpdateValidation,
  animalListValidation
} from '../validators/animalValidators.js';

const router = express.Router();

router.post(
  '/',
  protect,
  animalCreateValidation,
  validateRequest,
  createAnimal
);
router.get(
  '/',
  protect,
  animalListValidation,
  validateRequest,
  listAnimals
);
router.get('/:id', protect, getAnimal);
router.put(
  '/:id',
  protect,
  animalUpdateValidation,
  validateRequest,
  updateAnimal
);
router.delete('/:id', protect, deleteAnimal);

export default router;

