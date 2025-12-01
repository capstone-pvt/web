import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import { loginSchema } from '@/lib/utils/validation';
import { ValidationError } from '@/lib/utils/errors';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { setAuthCookies } from '@/lib/utils/cookies';
import { loginRateLimit } from '@/lib/middleware/rateLimit.middleware';
import { getDeviceInfo } from '@/lib/middleware/auth.middleware';

export async function POST(request: NextRequest) {
  try {
    await loginRateLimit(request);

    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Validation failed', validationResult.error.errors);
    }

    const credentials = validationResult.data;
    const deviceInfo = getDeviceInfo(request);

    const { user, accessToken, refreshToken } = await AuthService.login(credentials, deviceInfo);

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

    const response = successResponse({ user: userResponse }, 'Login successful');

    setAuthCookies(response, accessToken, refreshToken, credentials.rememberMe || false);

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
