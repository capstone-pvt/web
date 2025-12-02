import { NextRequest } from 'next/server';
import PermissionRepository from '@/lib/repositories/permission.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest, authorizeRequest } from '@/lib/middleware/auth.middleware';
import { PERMISSIONS } from '@/config/permissions';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.PERMISSIONS_MANAGE]);

    const { id } = await params;
    const body = await request.json();
    const permission = await PermissionRepository.update(id, body);
    return successResponse({ permission });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.PERMISSIONS_MANAGE]);

    const { id } = await params;
    await PermissionRepository.delete(id);
    return successResponse(null, 'Permission deleted successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
