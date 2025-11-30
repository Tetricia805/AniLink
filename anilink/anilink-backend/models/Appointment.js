import mongoose from 'mongoose';
import {
  APPOINTMENT_STATUS,
  CONSULTATION_MODES,
  LIVESTOCK_SPECIES,
  PAYMENT_STATUS
} from '../constants/enums.js';

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: undefined
    },
    address: String,
    description: String
  },
  { _id: false }
);

const livestockSchema = new mongoose.Schema(
  {
    species: {
      type: String,
      enum: LIVESTOCK_SPECIES
    },
    herdSizeAffected: Number,
    primarySymptoms: {
      type: [String],
      default: []
    },
    notes: String
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS)
    },
    comment: String,
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    at: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VetProfile',
      required: true
    },
    service: {
      id: String,
      name: {
        type: String,
        required: true
      },
      description: String,
      fee: Number,
      currency: {
        type: String,
        default: 'UGX'
      }
    },
    scheduledFor: {
      type: Date,
      required: true
    },
    scheduledUntil: {
      type: Date,
      required: true
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 15
    },
    mode: {
      type: String,
      enum: CONSULTATION_MODES,
      required: true
    },
    location: locationSchema,
    meetingLink: String,
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.REQUESTED
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.NOT_REQUIRED
    },
    paymentReference: String,
    livestock: livestockSchema,
    farmerNotes: {
      type: String,
      maxlength: 2000
    },
    vetNotes: {
      assessment: String,
      treatment: String,
      followUp: String,
      attachments: [
        {
          url: String,
          label: String
        }
      ]
    },
    cancellation: {
      reason: String,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      cancelledAt: Date
    },
    timeline: {
      type: [timelineSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.index({ vet: 1, scheduledFor: 1 });
appointmentSchema.index({ farmer: 1, scheduledFor: -1 });
appointmentSchema.index({ status: 1 });

appointmentSchema.pre('validate', function (next) {
  if (this.scheduledFor && this.durationMinutes) {
    this.scheduledUntil = new Date(
      this.scheduledFor.getTime() + this.durationMinutes * 60000
    );
  }
  next();
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);

