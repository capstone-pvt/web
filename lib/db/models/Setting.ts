import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  companyName: string;
  companyLogo?: string;
  jwt_access_token_secret: string;
  jwt_access_token_expires_in: string;
  jwt_refresh_token_secret: string;
  jwt_refresh_token_expires_in: string;
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
}

const SettingSchema = new Schema<ISetting>({
  companyName: { type: String, required: true, default: 'My Company' },
  companyLogo: { type: String },
  jwt_access_token_secret: { type: String, required: true, default: 'your-access-token-secret' },
  jwt_access_token_expires_in: { type: String, required: true, default: '15m' },
  jwt_refresh_token_secret: { type: String, required: true, default: 'your-refresh-token-secret' },
  jwt_refresh_token_expires_in: { type: String, required: true, default: '7d' },
  maxLoginAttempts: { type: Number, required: true, default: 5 },
  lockoutDuration: { type: Number, required: true, default: 15 },
}, {
  timestamps: true,
});

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
