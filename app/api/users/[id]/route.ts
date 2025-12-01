import { NextRequest } from 'next/server';
import UserService from '@/lib/services/user.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { requirePermission } from '@/lib/middleware/permission.middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { PERMISSIONS } from '@/config/permissions';
import { updateUserSchema } from '@/lib/utils/validation';
import { ValidationError } from '@/lib/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authRequest = await authenticateRequest(request);

    // Users can view their own profile, or need users.read permission
    if (authRequest.user!.userId !== params.id) {
      await requirePermission(authRequest, PERMISSIONS.USERS_READ);
    }

    const user = await UserService.getUserById(params.id);

    if (!user) {
      return errorResponse(new Error('User not found'));
    }

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      roles: user.roles.map((r: any) => ({
        id: r._id.toString(),
        name: r.name,
        displayName: r.displayName,
        description: r.description,
        hierarchy: r.hierarchy
      })),
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString()
    };

    return successResponse({ user: userResponse });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authRequest = await authenticateRequest(request);

    const body = await request.json();

    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Validation failed', validationResult.error.errors);
    }

    const userData = validationResult.data;

    const user = await UserService.updateUser(params.id, userData, authRequest.user!.userId);

    const userResponse = {
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
      }))
    };

    return successResponse({ user: userResponse }, 'User updated successfully');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authRequest = await authenticateRequest(request);
    await requirePermission(authRequest, PERMISSIONS.USERS_DELETE);

    await UserService.deleteUser(params.id, authRequest.user!.userId);

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
