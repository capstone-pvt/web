import { NextRequest } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import { UnauthorizedError } from '@/lib/utils/errors';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { setAuthCookies, getRefreshToken } from '@/lib/utils/cookies';
import { generateRefreshToken } from '@/lib/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const { user, accessToken } = await AuthService.refreshAccessToken(refreshToken);

    const permissions = user.roles.flatMap((role: any) =>
      role.permissions.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        displayName: p.displayName,
        description: p.description,
        resource: p.resource,
        action: p.action,
        category: p.category,
        isSystemPermission: p.isSystemPermission
      }))
    );

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      roles: user.roles.map((r: any) => ({
        id: r._id.toString(),
        name: r.name,
        displayName: r.displayName,
        description: r.description,
        hierarchy: r.hierarchy
      })),
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
