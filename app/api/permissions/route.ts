import { NextResponse } from 'next/server';
import PermissionRepository from '@/lib/repositories/permission.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';

export async function GET(request: Request) {
  try {
    await authenticateRequest(request);
    const permissions = await PermissionRepository.findAll();
    return successResponse({ permissions });
  } catch (error) {
    return errorResponse(error);
  }
}
