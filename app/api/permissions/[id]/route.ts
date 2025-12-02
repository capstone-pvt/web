import { NextRequest } from 'next/server';
import PermissionRepository from '@/lib/repositories/permission.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authenticateRequest(request);
    // TODO: Add authorization check to ensure only admins can update permissions
    const { id } = params;
    const body = await request.json();
    const permission = await PermissionRepository.update(id, body);
    return successResponse({ permission });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authenticateRequest(request);
    // TODO: Add authorization check to ensure only admins can delete permissions
    const { id } = params;
    await PermissionRepository.delete(id);
    return successResponse(null, 'Permission deleted successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
