import { AuthenticatedRequest } from './auth.middleware';
import { ForbiddenError } from '@/lib/utils/errors';
import UserRepository from '@/lib/repositories/user.repository';

export async function requirePermission(
  request: AuthenticatedRequest,
  permission: string
): Promise<void> {
  if (!request.user) {
    throw new ForbiddenError('Authentication required');
  }

  const user = await UserRepository.findById(request.user.userId);
  if (!user) {
    throw new ForbiddenError('User not found');
  }

  const hasPermission = await user.hasPermission(permission);
  if (!hasPermission) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

export async function requireRole(
  request: AuthenticatedRequest,
  roleName: string
): Promise<void> {
  if (!request.user) {
    throw new ForbiddenError('Authentication required');
  }

  const user = await UserRepository.findById(request.user.userId);
  if (!user) {
    throw new ForbiddenError('User not found');
  }

  const hasRole = await user.hasRole(roleName);
  if (!hasRole) {
    throw new ForbiddenError(`Missing required role: ${roleName}`);
  }
}

export async function requireAnyPermission(
  request: AuthenticatedRequest,
  permissions: string[]
): Promise<void> {
  if (!request.user) {
    throw new ForbiddenError('Authentication required');
  }

  const user = await UserRepository.findById(request.user.userId);
  if (!user) {
    throw new ForbiddenError('User not found');
  }

  for (const permission of permissions) {
    const hasPermission = await user.hasPermission(permission);
    if (hasPermission) {
      return;
    }
  }

  throw new ForbiddenError(`Missing any of required permissions: ${permissions.join(', ')}`);
}
