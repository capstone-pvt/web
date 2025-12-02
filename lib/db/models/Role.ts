import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  displayName: string;
  description: string;
  hierarchy: number;
  permissions: Types.ObjectId[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
  canManage(targetRole: IRole): boolean;
}

const RoleSchema = new Schema<IRole>({
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
  hierarchy: {
    type: Number,
    required: true,
    index: true
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  isSystemRole: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Instance method: Check if this role can manage target role
RoleSchema.methods.canManage = function(targetRole: IRole): boolean {
  return this.hierarchy < targetRole.hierarchy;
};

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
