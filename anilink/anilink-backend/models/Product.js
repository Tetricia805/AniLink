import mongoose from 'mongoose';
import {
  PRODUCT_CATEGORIES,
  UNIT_TYPES,
  USER_ROLES
} from '../constants/enums.js';

const pricingSchema = new mongoose.Schema(
  {
    unitPrice: { type: Number, required: true },
    currency: { type: String, default: 'UGX' },
    discountPrice: Number
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    methods: {
      type: [String],
      default: ['pickup']
    },
    deliveryRadiusKm: Number,
    fee: Number
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: 2000
    },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      default: 'other'
    },
    unit: {
      type: String,
      enum: UNIT_TYPES,
      default: 'piece'
    },
    pricing: pricingSchema,
    stockQuantity: {
      type: Number,
      default: 0
    },
    reorderLevel: {
      type: Number,
      default: 0
    },
    media: [
      {
        url: String,
        label: String
      }
    ],
    tags: {
      type: [String],
      default: []
    },
    shipping: shippingSchema,
    allowPartial: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    metadata: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

productSchema.index({ vendor: 1, name: 1 }, { unique: true });
productSchema.index({ category: 1, isActive: 1 });

export const Product = mongoose.model('Product', productSchema);

