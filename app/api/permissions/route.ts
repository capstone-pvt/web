import { NextRequest } from 'next/server';
import PermissionService from '@/lib/services/permission.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { requirePermission } from '@/lib/middleware/permission.middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { PERMISSIONS } from '@/config/permissions';

export async function GET(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await requirePermission(authRequest, PERMISSIONS.PERMISSIONS_READ);

    const categorized = await PermissionService.getAllCategorized();

    const permissionsResponse: any = {};
    Object.keys(categorized).forEach(category => {
      permissionsResponse[category] = categorized[category].map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        displayName: p.displayName,
        description: p.description,
        resource: p.resource,
        action: p.action,
        category: p.category,
        isSystemPermission: p.isSystemPermission
      }));
    });

    return successResponse({ permissions: permissionsResponse });
  } catch (error) {
    return errorResponse(error);
  }
}
