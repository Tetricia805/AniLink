import mongoose from 'mongoose';
import {
  HERD_TYPES,
  LIVESTOCK_PURPOSE,
  LIVESTOCK_SPECIES
} from '../constants/enums.js';

const herdSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    species: {
      type: [String],
      enum: LIVESTOCK_SPECIES,
      required: true
    },
    herdType: {
      type: String,
      enum: HERD_TYPES,
      default: 'mixed'
    },
    primaryPurpose: {
      type: String,
      enum: LIVESTOCK_PURPOSE,
      default: 'dual-purpose'
    },
    sizeEstimate: {
      adultFemales: { type: Number, default: 0 },
      adultMales: { type: Number, default: 0 },
      youngStock: { type: Number, default: 0 },
      layers: { type: Number, default: 0 }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: undefined
      },
      address: String
    },
    biosecurityMeasures: {
      type: [String],
      default: []
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

herdSchema.index({ farmer: 1, name: 1 }, { unique: true });
herdSchema.index({ location: '2dsphere' });

export const Herd = mongoose.model('Herd', herdSchema);

