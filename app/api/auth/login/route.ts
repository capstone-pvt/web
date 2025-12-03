import { NextRequest } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import { loginSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { setAuthCookies } from '@/lib/utils/cookies';
import { loginRateLimit } from '@/lib/middleware/rateLimit.middleware';
import { getDeviceInfo } from '@/lib/middleware/auth.middleware';
import { logLogin } from '@/lib/utils/auditLogger';
import { validateBody } from '@/lib/middleware/validation.middleware';

export async function POST(request: NextRequest) {
  try {
    await loginRateLimit(request);

    const { data: body, error: validationError } = await validateBody(loginSchema)(request);
    if (validationError) {
      return errorResponse(validationError);
    }

    const deviceInfo = getDeviceInfo(request);

    const { user, accessToken, refreshToken } = await AuthService.login(body, deviceInfo);

    // Log successful login
    await logLogin(request, body.email, user._id.toString());

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

    const response = successResponse({ user: userResponse }, 'Login successful');

    setAuthCookies(response, accessToken, refreshToken, body.rememberMe || false);

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
