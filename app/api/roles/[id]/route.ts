import { NextRequest } from 'next/server';
import RoleRepository from '@/lib/repositories/role.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest, authorizeRequest } from '@/lib/middleware/auth.middleware';
import { PERMISSIONS } from '@/config/permissions';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.ROLES_UPDATE]);

    const { id } = await params;
    const body = await request.json();
    const role = await RoleRepository.update(id, body);
    return successResponse({ role });
  } catch (error) {
    return errorResponse(error);
  }
}
