import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  appName: string;
  appLogo: string;
  companyName: string;
  companyLogo: string;
  jwt_access_token_secret: string;
  jwt_access_token_expires_in: string;
  jwt_refresh_token_secret: string;
  jwt_refresh_token_expires_in: string;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

const SettingSchema = new Schema<ISetting>({
  appName: { type: String, default: 'RBAC App' },
  appLogo: { type: String, default: '' },
  companyName: { type: String, default: 'My Company' },
  companyLogo: { type: String, default: '' },
  jwt_access_token_secret: { type: String, required: true },
  jwt_access_token_expires_in: { type: String, required: true },
  jwt_refresh_token_secret: { type: String, required: true },
  jwt_refresh_token_expires_in: { type: String, required: true },
  maxLoginAttempts: { type: Number, default: 5 },
  lockoutDuration: { type: Number, default: 15 },
}, {
  timestamps: true,
});

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
