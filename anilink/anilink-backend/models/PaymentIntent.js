import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/enums.js';

const paymentIntentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VetProfile'
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'UGX'
    },
    channel: {
      type: String,
      enum: ['flutterwave', 'mtn_momo', 'airtel_money', 'manual'],
      default: 'flutterwave'
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    reference: {
      type: String,
      required: true,
      unique: true
    },
    purpose: {
      type: String,
      enum: ['appointment', 'order'],
      default: 'appointment'
    },
    providerResponse: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

paymentIntentSchema.index({ farmer: 1 });
paymentIntentSchema.index({ vet: 1 });

export const PaymentIntent = mongoose.model(
  'PaymentIntent',
  paymentIntentSchema
);

paymentIntentSchema.pre('validate', function (next) {
  if (!this.appointment && !this.order) {
    return next(
      new Error('PaymentIntent must reference an appointment or an order')
    );
  }
  return next();
});

