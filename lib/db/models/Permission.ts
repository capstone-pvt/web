import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPermission extends Document {
  _id: Types.ObjectId;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  isSystemPermission: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    lowercase: true,
    enum: ['create', 'read', 'update', 'delete', 'view', 'manage', 'execute']
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  isSystemPermission: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
PermissionSchema.index({ name: 1 }, { unique: true });
PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ category: 1 });

export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);
