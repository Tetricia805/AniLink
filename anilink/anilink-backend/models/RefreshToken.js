import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
      index: true
    },
    userAgent: String,
    ip: String,
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: Date,
    replacedBy: String
  },
  {
    timestamps: true
  }
);

refreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt;
});

refreshTokenSchema.virtual('isActive').get(function () {
  return !this.revokedAt && !this.isExpired;
});

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

