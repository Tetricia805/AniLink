import { body } from 'express-validator';
import { LIVESTOCK_SPECIES, REGIONS } from '../constants/enums.js';

export const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().trim(),
  body('region').optional().isIn(REGIONS),
  body('district').optional().trim(),
  body('preferredLanguages.*').optional().isString(),
  body('farmerProfile.primarySpecies.*')
    .optional()
    .isIn(LIVESTOCK_SPECIES)
    .withMessage('Unsupported species')
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

