import { NextRequest } from 'next/server';
import RoleService from '@/lib/services/role.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { requirePermission } from '@/lib/middleware/permission.middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { PERMISSIONS } from '@/config/permissions';

export async function GET(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await requirePermission(authRequest, PERMISSIONS.ROLES_READ);

    const roles = await RoleService.getAllRoles();

    const rolesResponse = roles.map((role: any) => ({
      id: role._id.toString(),
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      hierarchy: role.hierarchy,
      isSystemRole: role.isSystemRole,
      permissions: role.permissions.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        displayName: p.displayName,
        category: p.category
      })),
      createdAt: role.createdAt.toISOString()
    }));

    return successResponse({ roles: rolesResponse });
  } catch (error) {
    return errorResponse(error);
  }
}
