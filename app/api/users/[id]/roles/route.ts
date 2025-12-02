import { NextRequest } from 'next/server';
import UserRepository from '@/lib/repositories/user.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authenticateRequest(request);
    // TODO: Add authorization check to ensure only admins can access
    const { id } = params;
    const body = await request.json();
    const { roles } = body;
    const user = await UserRepository.updateRoles(id, roles);
    return successResponse({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
