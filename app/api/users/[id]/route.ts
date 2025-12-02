import { NextRequest } from 'next/server';
import UserService from '@/lib/services/user.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { requirePermission } from '@/lib/middleware/permission.middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { PERMISSIONS } from '@/config/permissions';
import { updateUserSchema } from '@/lib/utils/validation';
import { ValidationError } from '@/lib/utils/errors';
import { logAuthenticatedAction } from '@/lib/utils/auditLogger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authRequest = await authenticateRequest(request);

    // Users can view their own profile, or need users.read permission
    if (authRequest.user!.userId !== id) {
      await requirePermission(authRequest, PERMISSIONS.USERS_READ);
    }

    const user = await UserService.getUserById(id);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authRequest = await authenticateRequest(request);

    const body = await request.json();

    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Validation failed', validationResult.error.errors);
    }

    const userData = validationResult.data;

    const user = await UserService.updateUser(id, userData, authRequest.user!.userId);

    // Log user update
    await logAuthenticatedAction(authRequest, 'users.update', 'users', {
      resourceId: id,
      details: {
        updatedFields: Object.keys(userData),
        email: user.email,
        fullName: user.fullName
      }
    });

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
  } catch (error: any) {
    // Log failed user update
    const { id } = await params;
    const authRequest = await authenticateRequest(request).catch(() => null);
    if (authRequest) {
      await logAuthenticatedAction(authRequest, 'users.update', 'users', {
        resourceId: id,
        status: 'failure',
        errorMessage: error.message
      });
    }
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authRequest = await authenticateRequest(request);
    await requirePermission(authRequest, PERMISSIONS.USERS_DELETE);

    // Get user info before deletion for logging
    const userToDelete = await UserService.getUserById(id);

    await UserService.deleteUser(id, authRequest.user!.userId);

    // Log user deletion
    await logAuthenticatedAction(authRequest, 'users.delete', 'users', {
      resourceId: id,
      details: {
        deletedUser: {
          email: userToDelete?.email,
          fullName: userToDelete?.fullName
        }
      }
    });

    return successResponse(null, 'User deleted successfully');
  } catch (error: any) {
    // Log failed user deletion
    const { id } = await params;
    const authRequest = await authenticateRequest(request).catch(() => null);
    if (authRequest) {
      await logAuthenticatedAction(authRequest, 'users.delete', 'users', {
        resourceId: id,
        status: 'failure',
        errorMessage: error.message
      });
    }
    return errorResponse(error);
  }
}
