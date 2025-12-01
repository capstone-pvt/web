import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  refreshToken: string;
  deviceInfo: {
    userAgent?: string;
    ip?: string;
    browser?: string;
    os?: string;
  };
  isValid: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    browser: String,
    os: String
  },
  isValid: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
SessionSchema.index({ userId: 1, isValid: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
