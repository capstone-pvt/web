import { NextRequest } from 'next/server';
import UserService from '@/lib/services/user.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { requirePermission } from '@/lib/middleware/permission.middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { PERMISSIONS } from '@/config/permissions';
import { createUserSchema } from '@/lib/utils/validation';
import { ValidationError } from '@/lib/utils/errors';
import { PAGINATION } from '@/lib/utils/constants';

export async function GET(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await requirePermission(authRequest, PERMISSIONS.USERS_READ);

    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
      page: parseInt(searchParams.get('page') || String(PAGINATION.DEFAULT_PAGE)),
      limit: parseInt(searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT)),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      order: (searchParams.get('order') || 'desc') as 'asc' | 'desc'
    };

    const { users, total } = await UserService.getAllUsers(filters);

    const usersResponse = users.map((user: any) => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      roles: user.roles.map((r: any) => ({
        id: r._id.toString(),
        name: r.name,
        displayName: r.displayName,
        hierarchy: r.hierarchy
      })),
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString()
    }));

    return successResponse({
      users: usersResponse,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);
    await requirePermission(authRequest, PERMISSIONS.USERS_CREATE);

    const body = await request.json();

    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Validation failed', validationResult.error.errors);
    }

    const userData = validationResult.data;

    const user = await UserService.createUser(userData, authRequest.user!.userId);

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      roles: user.roles
    };

    return successResponse({ user: userResponse }, 'User created successfully', 201);
  } catch (error) {
    return errorResponse(error);
  }
}
