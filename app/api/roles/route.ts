import { NextResponse } from 'next/server';
import RoleRepository from '@/lib/repositories/role.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest, authorizeRequest } from '@/lib/middleware/auth.middleware';
import { PERMISSIONS } from '@/config/permissions';

export async function GET(request: Request) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.ROLES_READ]);

    const roles = await RoleRepository.findAll();
    return successResponse({ roles });
  } catch (error) {
    return errorResponse(error);
  }
}
