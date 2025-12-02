import { NextRequest } from 'next/server';
import PermissionRepository from '@/lib/repositories/permission.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest, authorizeRequest } from '@/lib/middleware/auth.middleware';
import { PERMISSIONS } from '@/config/permissions';

export async function POST(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.PERMISSIONS_MANAGE]);

    const body = await request.json();
    const permission = await PermissionRepository.create(body);
    return successResponse({ permission });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.PERMISSIONS_READ]);

    const permissions = await PermissionRepository.findAll();
    return successResponse({ permissions });
  } catch (error) {
    return errorResponse(error);
  }
}
