import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { requirePermission } from '@/lib/middleware/permission.middleware';
import { PERMISSIONS } from '@/config/permissions';
import AuditLogService from '@/lib/services/auditLog.service';
import { successResponse } from '@/lib/utils/apiResponse';
import { handleApiError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await requirePermission(authRequest, PERMISSIONS.ANALYTICS_VIEW);

    const { searchParams } = new URL(request.url);

    const filters = {
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
    };

    const statistics = await AuditLogService.getStatistics(filters);

    return successResponse({ statistics });
  } catch (error) {
    return handleApiError(error);
  }
}
