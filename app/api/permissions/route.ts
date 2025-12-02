import { NextRequest } from 'next/server';
import PermissionRepository from '@/lib/repositories/permission.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';

export async function POST(request: NextRequest) {
  try {
    await authenticateRequest(request);
    // TODO: Add authorization check to ensure only admins can create permissions
    const body = await request.json();
    const permission = await PermissionRepository.create(body);
    return successResponse({ permission });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request);
    const permissions = await PermissionRepository.findAll();
    return successResponse({ permissions });
  } catch (error) {
    return errorResponse(error);
  }
}
