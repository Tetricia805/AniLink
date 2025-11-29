import { body } from 'express-validator';
import { MESSAGE_CHANNEL_TYPES } from '../constants/enums.js';

export const conversationCreateValidation = [
  body('participants')
    .isArray({ min: 1 })
    .withMessage('participants required'),
  body('participants.*').isMongoId(),
  body('channelType')
    .optional()
    .isIn(MESSAGE_CHANNEL_TYPES)
    .withMessage('Invalid channel type')
];

export const sendMessageValidation = [
  body('body').notEmpty().withMessage('Message body required'),
  body('attachments.*.url').optional().isURL()
];

