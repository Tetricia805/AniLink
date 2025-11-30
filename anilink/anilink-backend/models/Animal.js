import mongoose from 'mongoose';
import {
  ANIMAL_STATUS,
  LIVESTOCK_SPECIES,
  LIVESTOCK_PURPOSE
} from '../constants/enums.js';

const weightHistorySchema = new mongoose.Schema(
  {
    weightKg: Number,
    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const vaccinationSchema = new mongoose.Schema(
  {
    vaccine: String,
    date: Date,
    administeredBy: String,
    reactions: String,
    nextDueDate: Date
  },
  { _id: false }
);

const animalSchema = new mongoose.Schema(
  {
    herd: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Herd',
      required: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tagId: {
      type: String,
      required: true
    },
    species: {
      type: String,
      enum: LIVESTOCK_SPECIES,
      required: true
    },
    breed: String,
    sex: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'female'
    },
    dateOfBirth: Date,
    purpose: {
      type: String,
      enum: LIVESTOCK_PURPOSE,
      default: 'dual-purpose'
    },
    status: {
      type: String,
      enum: ANIMAL_STATUS,
      default: 'active'
    },
    weightHistory: {
      type: [weightHistorySchema],
      default: []
    },
    lastKnownWeightKg: Number,
    vaccinationHistory: {
      type: [vaccinationSchema],
      default: []
    },
    reproduction: {
      lastCalvingDate: Date,
      parity: Number,
      expectedCalvingDate: Date
    },
    metadata: {
      color: String,
      distinguishingMarks: String
    }
  },
  {
    timestamps: true
  }
);

animalSchema.index({ farmer: 1, tagId: 1 }, { unique: true });
animalSchema.index({ herd: 1, species: 1 });

export const Animal = mongoose.model('Animal', animalSchema);

