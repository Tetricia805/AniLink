import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    change: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      enum: ['manual', 'order', 'restock', 'adjustment'],
      default: 'manual'
    },
    referenceId: String,
    notes: String
  },
  {
    timestamps: true
  }
);

inventoryLogSchema.index({ product: 1, createdAt: -1 });

export const InventoryLog = mongoose.model(
  'InventoryLog',
  inventoryLogSchema
);

