import mongoose from 'mongoose';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TARGETS
} from '../constants/enums.js';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetRole: {
      type: String,
      enum: NOTIFICATION_TARGETS
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    data: mongoose.Schema.Types.Mixed,
    readAt: Date,
    deliveredAt: Date,
    expiresAt: Date,
    priority: {
      type: Number,
      default: 3
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $exists: true } } });

export const Notification = mongoose.model(
  'Notification',
  notificationSchema
);

