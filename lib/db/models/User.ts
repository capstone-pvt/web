import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  roles: Types.ObjectId[];
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasRole(roleName: string): Promise<boolean>;
  hasPermission(permissionName: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  lastLoginAt: Date,
  lastLoginIp: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ createdAt: -1 });

// Virtual: fullName
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook: Hash password if modified
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: Compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method: Check if user has role
UserSchema.methods.hasRole = async function(roleName: string): Promise<boolean> {
  await this.populate('roles');
  return this.roles.some((role: any) => role.name === roleName);
};

// Instance method: Check if user has permission
UserSchema.methods.hasPermission = async function(permissionName: string): Promise<boolean> {
  await this.populate({
    path: 'roles',
    populate: { path: 'permissions' }
  });

  for (const role of this.roles as any[]) {
    if (role.permissions && role.permissions.some((p: any) => p.name === permissionName)) {
      return true;
    }
  }
  return false;
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
