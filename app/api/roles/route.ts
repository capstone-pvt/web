import { NextResponse } from 'next/server';
import RoleRepository from '@/lib/repositories/role.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';

export async function GET(request: Request) {
  try {
    await authenticateRequest(request);
    const roles = await RoleRepository.findAll();
    return successResponse({ roles });
  } catch (error) {
    return errorResponse(error);
  }
}
