import { NextRequest } from 'next/server';
import UserRepository from '@/lib/repositories/user.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { UserFilters } from '@/types/user.types';

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request);
    // TODO: Add authorization check to ensure only admins can access

    const { searchParams } = new URL(request.url);
    const filters: UserFilters = {
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      isActive: searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      page: searchParams.has('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      order: searchParams.get('order') || 'desc',
    };

    const { users, totalPages } = await UserRepository.findAll(filters);
    return successResponse({ users, totalPages });
  } catch (error) {
    return errorResponse(error);
  }
}
