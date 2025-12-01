import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  action: string; // e.g., 'users.create', 'users.update', 'users.delete'
  resource: string; // e.g., 'users', 'roles', 'projects'
  resourceId?: string; // ID of the affected resource
  details?: Record<string, any>; // Additional details about the action
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true,
      index: true
    },
    userName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true,
      index: true,
      // Examples: 'users.create', 'users.update', 'users.delete', 'auth.login', 'auth.logout'
    },
    resource: {
      type: String,
      required: true,
      index: true,
      // Examples: 'users', 'roles', 'projects', 'settings', 'auth'
    },
    resourceId: {
      type: String,
      index: true
      // ID of the affected resource (e.g., user ID, role ID)
    },
    details: {
      type: Schema.Types.Mixed,
      // Store additional information like changed fields, old/new values, etc.
    },
    ipAddress: {
      type: String,
      index: true
    },
    userAgent: {
      type: String
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
      default: 'success',
      index: true
    },
    errorMessage: {
      type: String
      // Store error message if status is 'failure'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    }
  },
  {
    timestamps: false // We're using our own timestamp field
  }
);

// Index for efficient querying
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

// Static method to create a log entry
AuditLogSchema.statics.log = async function(data: {
  userId: string | mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failure';
  errorMessage?: string;
}) {
  return this.create({
    ...data,
    timestamp: new Date()
  });
};

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
