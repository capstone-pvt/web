import AuditLog, { IAuditLog } from '../db/models/AuditLog';
import connectDB from '../db/mongodb';

export interface AuditLogFilters {
  userId?: string;
  userEmail?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  status?: 'success' | 'failure';
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

class AuditLogRepository {
  async create(data: {
    userId: string;
    userEmail: string;
    userName: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    status?: 'success' | 'failure';
    errorMessage?: string;
  }): Promise<IAuditLog> {
    await connectDB();
    return AuditLog.create({
      ...data,
      timestamp: new Date()
    });
  }

  async findAll(filters: AuditLogFilters): Promise<{ logs: IAuditLog[]; total: number }> {
    await connectDB();

    const {
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    const query: Record<string, unknown> = {};

    if (userId) {
      query.userId = userId;
    }

    if (userEmail) {
      query.userEmail = { $regex: userEmail, $options: 'i' };
    }

    if (action) {
      query.action = action;
    }

    if (resource) {
      query.resource = resource;
    }

    if (resourceId) {
      query.resourceId = resourceId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.timestamp = {} as { $gte?: Date; $lte?: Date };
      if (startDate) {
        (query.timestamp as { $gte?: Date; $lte?: Date }).$gte = startDate;
      }
      if (endDate) {
        (query.timestamp as { $gte?: Date; $lte?: Date }).$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        _id: log._id.toString()
      })) as unknown as IAuditLog[],
      total
    };
  }

  async findByUserId(userId: string, limit: number = 100): Promise<IAuditLog[]> {
    await connectDB();
    const logs = await AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();

    return logs.map(log => ({
      ...log,
      _id: log._id.toString()
    })) as unknown as IAuditLog[];
  }

  async findByResource(resource: string, resourceId?: string, limit: number = 100): Promise<IAuditLog[]> {
    await connectDB();
    const query: Record<string, unknown> = { resource };
    if (resourceId) {
      query.resourceId = resourceId;
    }
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();

    return logs.map(log => ({
      ...log,
      _id: log._id.toString()
    })) as unknown as IAuditLog[];
  }

  async getRecentActivity(limit: number = 100): Promise<IAuditLog[]> {
    await connectDB();
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();

    return logs.map(log => ({
      ...log,
      _id: log._id.toString()
    })) as unknown as IAuditLog[];
  }

  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalLogs: number;
    successCount: number;
    failureCount: number;
    byAction: Record<string, number>;
    byResource: Record<string, number>;
    byUser: Array<{ userId: string; userEmail: string; count: number }>;
  }> {
    await connectDB();

    const query: Record<string, unknown> = {};
    if (filters?.startDate || filters?.endDate) {
      query.timestamp = {} as { $gte?: Date; $lte?: Date };
      if (filters.startDate) {
        (query.timestamp as { $gte?: Date; $lte?: Date }).$gte = filters.startDate;
      }
      if (filters.endDate) {
        (query.timestamp as { $gte?: Date; $lte?: Date }).$lte = filters.endDate;
      }
    }

    const [
      totalLogs,
      successCount,
      failureCount,
      byAction,
      byResource,
      byUser
    ] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.countDocuments({ ...query, status: 'success' }),
      AuditLog.countDocuments({ ...query, status: 'failure' }),
      AuditLog.aggregate([
        { $match: query },
        { $group: { _id: '$action', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: query },
        { $group: { _id: '$resource', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: query },
        { $group: { _id: { userId: '$userId', userEmail: '$userEmail' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      totalLogs,
      successCount,
      failureCount,
      byAction: byAction.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byResource: byResource.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byUser: byUser.map((item: { _id: { userId: string; userEmail: string }; count: number }) => ({
        userId: item._id.userId,
        userEmail: item._id.userEmail,
        count: item.count
      }))
    };
  }
}

export default new AuditLogRepository();
