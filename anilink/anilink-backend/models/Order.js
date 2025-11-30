import mongoose from 'mongoose';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  FULFILLMENT_STATUS,
  SHIPPING_METHODS
} from '../constants/enums.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'UGX'
    }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    contactName: String,
    phone: String,
    addressLine: String,
    district: String,
    region: String,
    coordinates: {
      type: [Number],
      default: undefined
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [orderItemSchema],
      validate: [(val) => val.length > 0, 'Order must have at least one item']
    },
    subtotal: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'UGX'
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    fulfillmentStatus: {
      type: String,
      enum: Object.values(FULFILLMENT_STATUS),
      default: FULFILLMENT_STATUS.NOT_APPLICABLE
    },
    shippingMethod: {
      type: String,
      enum: SHIPPING_METHODS,
      default: 'pickup'
    },
    shippingAddress: shippingAddressSchema,
    notes: String,
    timeline: [
      {
        status: String,
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        comment: String,
        at: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

orderSchema.index({ farmer: 1, createdAt: -1 });
orderSchema.index({ vendor: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);

