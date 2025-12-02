import { NextRequest } from 'next/server';
import UserRepository from '@/lib/repositories/user.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest, authorizeRequest } from '@/lib/middleware/auth.middleware';
import { PERMISSIONS } from '@/config/permissions';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.USERS_UPDATE]);

    const { id } = await params;
    const body = await request.json();
    const { roles } = body;
    const user = await UserRepository.updateRoles(id, roles);
    return successResponse({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
