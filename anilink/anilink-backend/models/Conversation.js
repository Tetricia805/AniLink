import mongoose from 'mongoose';
import { MESSAGE_CHANNEL_TYPES } from '../constants/enums.js';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    channelType: {
      type: String,
      enum: MESSAGE_CHANNEL_TYPES,
      default: 'farmer_vet'
    },
    lastMessageAt: Date,
    lastMessage: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model(
  'Conversation',
  conversationSchema
);

