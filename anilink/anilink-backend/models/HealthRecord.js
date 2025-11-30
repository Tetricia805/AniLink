import mongoose from 'mongoose';
import {
  RECORD_TYPES,
  VACCINE_TYPES,
  LIVESTOCK_SPECIES
} from '../constants/enums.js';

const attachmentSchema = new mongoose.Schema(
  {
    url: String,
    label: String,
    mimeType: String
  },
  { _id: false }
);

const labResultSchema = new mongoose.Schema(
  {
    testName: String,
    result: String,
    unit: String,
    referenceRange: String,
    conductedAt: Date
  },
  { _id: false }
);

const treatmentSchema = new mongoose.Schema(
  {
    drug: String,
    dosage: String,
    frequency: String,
    durationDays: Number,
    administeredBy: String
  },
  { _id: false }
);

const vaccineSchema = new mongoose.Schema(
  {
    vaccine: {
      type: String,
      enum: [...VACCINE_TYPES, 'other']
    },
    batchNumber: String,
    administeredAt: Date,
    nextDueDate: Date
  },
  { _id: false }
);

const healthRecordSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal'
    },
    herd: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Herd'
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VetProfile'
    },
    recordType: {
      type: String,
      enum: RECORD_TYPES,
      default: 'treatment'
    },
    species: {
      type: String,
      enum: LIVESTOCK_SPECIES,
      required: true
    },
    diagnosis: String,
    symptoms: {
      type: [String],
      default: []
    },
    treatmentPlan: {
      type: [treatmentSchema],
      default: []
    },
    vaccinesAdministered: {
      type: [vaccineSchema],
      default: []
    },
    labResults: {
      type: [labResultSchema],
      default: []
    },
    followUpDate: Date,
    mortality: {
      outcome: {
        type: String,
        enum: ['recovered', 'alive', 'dead'],
        default: 'alive'
      },
      date: Date,
      notes: String
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

healthRecordSchema.index({ farmer: 1, createdAt: -1 });
healthRecordSchema.index({ animal: 1, createdAt: -1 });
healthRecordSchema.index({ herd: 1 });

export const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

