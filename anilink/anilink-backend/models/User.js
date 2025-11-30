import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  USER_ROLES,
  USER_STATUSES,
  REGIONS,
  LIVESTOCK_SPECIES,
  FARM_TYPES
} from '../constants/enums.js';

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [32.5825, 0.3476] // Kampala
    }
  },
  { _id: false }
);

const farmerProfileSchema = new mongoose.Schema(
  {
    primarySpecies: {
      type: [String],
      enum: LIVESTOCK_SPECIES,
      default: undefined
    },
    herdSizeRange: {
      type: String,
      enum: ['0-20', '21-50', '51-100', '100+']
    },
    farmType: {
      type: String,
      enum: FARM_TYPES
    },
    cooperativeMemberships: {
      type: [String],
      default: []
    },
    registrationId: String
  },
  { _id: false }
);

const securitySchema = new mongoose.Schema(
  {
    lastLoginAt: Date,
    lastPasswordChangeAt: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.FARMER
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUSES),
      default: USER_STATUSES.PENDING
    },
    region: {
      type: String,
      enum: REGIONS,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    address: {
      type: String
    },
    location: {
      type: locationSchema,
      default: () => ({})
    },
    avatar: String,
    preferredLanguages: {
      type: [String],
      default: ['English']
    },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'sms', 'whatsapp', 'email'],
      default: 'phone'
    },
    farmerProfile: farmerProfileSchema,
    security: {
      type: securitySchema,
      default: () => ({})
    },
    verified: {
      type: Boolean,
      default: false
    },
    metadata: {
      device: String,
      lastIp: String
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1, region: 1, district: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.security.lastPasswordChangeAt = new Date();
  return next();
});

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      sub: this._id,
      role: this.role,
      status: this.status
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

userSchema.methods.generateRawRefreshToken = function () {
  return crypto.randomBytes(40).toString('hex');
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.security?.lastPasswordChangeAt) {
    const changedTimestamp = parseInt(
      this.security.lastPasswordChangeAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export const User = mongoose.model('User', userSchema);
