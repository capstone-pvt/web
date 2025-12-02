import { NextRequest } from 'next/server';
import RoleRepository from '@/lib/repositories/role.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authenticateRequest(request);
    const { id } = params;
    const body = await request.json();
    const { permissions } = body;
    const role = await RoleRepository.updatePermissions(id, permissions);
    return successResponse({ role });
  } catch (error) {
    return errorResponse(error);
  }
}
