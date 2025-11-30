import mongoose from 'mongoose';
import { AI_REQUEST_TYPES } from '../constants/enums.js';

const aiInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: Object.values(AI_REQUEST_TYPES),
      required: true
    },
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    confidence: Number,
    recommendations: [String],
    metadata: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

aiInteractionSchema.index({ user: 1, type: 1, createdAt: -1 });

export const AIInteraction = mongoose.model(
  'AIInteraction',
  aiInteractionSchema
);

