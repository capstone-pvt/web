import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { requirePermission } from '@/lib/middleware/permission.middleware';
import { PERMISSIONS } from '@/config/permissions';
import AuditLogService from '@/lib/services/auditLog.service';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { handleApiError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and require admin permissions
    const authRequest = await authenticateRequest(request);
    await requirePermission(authRequest, PERMISSIONS.USERS_READ); // Only users who can read users can view audit logs

    // Extract query parameters
    const { searchParams } = new URL(request.url);

    const filters = {
      userId: searchParams.get('userId') || undefined,
      userEmail: searchParams.get('userEmail') || undefined,
      action: searchParams.get('action') || undefined,
      resource: searchParams.get('resource') || undefined,
      resourceId: searchParams.get('resourceId') || undefined,
      status: (searchParams.get('status') as 'success' | 'failure') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50')
    };

    const { logs, pagination } = await AuditLogService.getAuditLogs(filters);

    return successResponse({
      logs,
      pagination
    });
  } catch (error) {
    return handleApiError(error);
  }
}
