import mongoose from 'mongoose';
import { AVAILABILITY_TYPES, WEEK_DAYS } from '../constants/enums.js';

const vetAvailabilitySchema = new mongoose.Schema(
  {
    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VetProfile',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(AVAILABILITY_TYPES),
      default: AVAILABILITY_TYPES.RECURRING
    },
    dayOfWeek: {
      type: String,
      enum: WEEK_DAYS,
      required: function () {
        return this.type === AVAILABILITY_TYPES.RECURRING;
      }
    },
    date: {
      type: Date,
      required: function () {
        return this.type !== AVAILABILITY_TYPES.RECURRING;
      }
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    slotDurationMinutes: {
      type: Number,
      default: 60
    },
    isActive: {
      type: Boolean,
      default: true
    },
    reason: String
  },
  {
    timestamps: true
  }
);

vetAvailabilitySchema.index({ vet: 1, dayOfWeek: 1 });
vetAvailabilitySchema.index({ vet: 1, date: 1 });

export const VetAvailability = mongoose.model(
  'VetAvailability',
  vetAvailabilitySchema
);

