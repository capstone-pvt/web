import { AuthenticatedRequest } from './auth.middleware';
import { ForbiddenError } from '@/lib/utils/errors';

export async function requirePermission(
  request: AuthenticatedRequest,
  permission: string
): Promise<void> {
  if (!request.user || !request.user.permissions) {
    throw new ForbiddenError('Authentication required');
  }

  if (!request.user.permissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

export async function requireRole(
  request: AuthenticatedRequest,
  roleName: string
): Promise<void> {
  if (!request.user || !request.user.roles) {
    throw new ForbiddenError('Authentication required');
  }

  if (!request.user.roles.includes(roleName)) {
    throw new ForbiddenError(`Missing required role: ${roleName}`);
  }
}

export async function requireAnyPermission(
  request: AuthenticatedRequest,
  permissions: string[]
): Promise<void> {
  if (!request.user || !request.user.permissions) {
    throw new ForbiddenError('Authentication required');
  }

  const hasPermission = permissions.some(p => request.user!.permissions.includes(p));

  if (!hasPermission) {
    throw new ForbiddenError(`Missing any of required permissions: ${permissions.join(', ')}`);
  }
}
