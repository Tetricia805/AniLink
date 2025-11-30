import mongoose from 'mongoose';
import {
  CONSULTATION_MODES,
  LIVESTOCK_SPECIES,
  PRACTICE_TYPES,
  REGIONS,
  USER_STATUSES,
  VET_SPECIALTIES,
  WEEK_DAYS
} from '../constants/enums.js';

const availabilitySchema = new mongoose.Schema(
  WEEK_DAYS.reduce((acc, day) => {
    acc[day] = {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
      available: { type: Boolean, default: ['saturday', 'sunday'].includes(day) ? false : true }
    };
    return acc;
  }, {}),
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    code: String,
    name: { type: String, required: true },
    description: String,
    baseFee: Number,
    currency: {
      type: String,
      default: 'UGX'
    }
  },
  { _id: false }
);

const vetProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    practiceName: {
      type: String,
      required: true
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    licenseExpiry: Date,
    specialtyAreas: {
      type: [String],
      enum: VET_SPECIALTIES,
      default: ['dairy']
    },
    speciesCoverage: {
      type: [String],
      enum: LIVESTOCK_SPECIES,
      default: ['cattle']
    },
    practiceTypes: {
      type: [String],
      enum: PRACTICE_TYPES,
      default: ['mobile']
    },
    consultationModes: {
      type: [String],
      enum: CONSULTATION_MODES,
      default: ['field', 'virtual']
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0
    },
    bio: {
      type: String,
      maxlength: 1200
    },
    services: {
      type: [serviceSchema],
      default: []
    },
    languages: {
      type: [String],
      default: ['English']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    address: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    region: {
      type: String,
      enum: REGIONS,
      required: true
    },
    coverageRadiusKm: {
      type: Number,
      default: 30
    },
    emergencySupport: {
      type: Boolean,
      default: false
    },
    consultationFee: {
      field: {
        type: Number,
        default: 50000
      },
      virtual: {
        type: Number,
        default: 30000
      },
      currency: {
        type: String,
        default: 'UGX'
      }
    },
    availability: availabilitySchema,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUSES),
      default: USER_STATUSES.PENDING
    },
    verificationDocuments: [
      {
        url: String,
        label: String
      }
    ],
    verifiedAt: Date,
    lastSeenAt: Date
  },
  {
    timestamps: true
  }
);

vetProfileSchema.index({ location: '2dsphere' });
vetProfileSchema.index({ region: 1, district: 1, specialtyAreas: 1 });
vetProfileSchema.index({ speciesCoverage: 1 });

export const VetProfile = mongoose.model('VetProfile', vetProfileSchema);

