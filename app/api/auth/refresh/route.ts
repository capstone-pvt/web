// import { NextRequest } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import { UnauthorizedError } from '@/lib/utils/errors';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { setAuthCookies, getRefreshToken } from '@/lib/utils/cookies';
import { generateRefreshToken } from '@/lib/utils/jwt';

export async function POST() {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const { user, accessToken } = await AuthService.refreshAccessToken(refreshToken);

    const permissions = user.roles.flatMap((role: unknown) => {
      const r = role as { permissions: unknown[] };
      return r.permissions.map((p: unknown) => {
        const perm = p as { _id: { toString: () => string }; name: string; displayName: string; description: string; resource: string; action: string; category: string; isSystemPermission: boolean };
        return {
          id: perm._id.toString(),
          name: perm.name,
          displayName: perm.displayName,
          description: perm.description,
          resource: perm.resource,
          action: perm.action,
          category: perm.category,
          isSystemPermission: perm.isSystemPermission
        };
      });
    });

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      roles: user.roles.map((r: unknown) => {
        const role = r as { _id: { toString: () => string }; name: string; displayName: string; description: string; hierarchy: number };
        return {
          id: role._id.toString(),
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          hierarchy: role.hierarchy
        };
      }),
      permissions
    };

    const response = successResponse({ user: userResponse }, 'Token refreshed');

    const newRefreshToken = generateRefreshToken({ userId: user._id.toString() });
    setAuthCookies(response, accessToken, newRefreshToken, false);

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
