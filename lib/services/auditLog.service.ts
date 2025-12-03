import AuditLogRepository, { AuditLogFilters } from '../repositories/auditLog.repository';
import { IAuditLog } from '../db/models/AuditLog';

export interface CreateAuditLogData {
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
}

class AuditLogService {
  /**
   * Log an activity/action
   */
  async log(data: CreateAuditLogData): Promise<void> {
    try {
      await AuditLogRepository.create(data);
    } catch (error) {
      // Don't throw - logging failures shouldn't break the application
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log a successful action
   */
  async logSuccess(data: Omit<CreateAuditLogData, 'status'>): Promise<void> {
    await this.log({ ...data, status: 'success' });
  }

  /**
   * Log a failed action
   */
  async logFailure(data: Omit<CreateAuditLogData, 'status'> & { errorMessage: string }): Promise<void> {
    await this.log({ ...data, status: 'failure' });
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: AuditLogFilters): Promise<{
    logs: IAuditLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { logs, total } = await AuditLogRepository.findAll(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 50;

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserActivity(userId: string, limit?: number): Promise<IAuditLog[]> {
    return AuditLogRepository.findByUserId(userId, limit);
  }

  /**
   * Get audit logs for a specific resource
   */
  async getResourceActivity(resource: string, resourceId?: string, limit?: number): Promise<IAuditLog[]> {
    return AuditLogRepository.findByResource(resource, resourceId, limit);
  }

  /**
   * Get recent activity across the system
   */
  async getRecentActivity(limit?: number): Promise<IAuditLog[]> {
    return AuditLogRepository.getRecentActivity(limit);
  }

  /**
   * Get audit log statistics
   */
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
    return AuditLogRepository.getStatistics(filters);
  }
}

export default new AuditLogService();
