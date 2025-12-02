import { NextRequest } from 'next/server';
import UserRepository from '@/lib/repositories/user.repository';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { authenticateRequest, authorizeRequest } from '@/lib/middleware/auth.middleware';
import { UserFilters } from '@/types/user.types';
import { PERMISSIONS } from '@/config/permissions';

export async function GET(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await authorizeRequest(authRequest, [PERMISSIONS.USERS_READ]);

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
    
    // Nest totalPages inside a pagination object
    return successResponse({ 
      users, 
      pagination: { totalPages } 
    });
  } catch (error) {
    return errorResponse(error);
  }
}
