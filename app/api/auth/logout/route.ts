import { NextRequest } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { clearAuthCookies, getRefreshToken } from '@/lib/utils/cookies';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { logLogout } from '@/lib/utils/auditLogger';

export async function POST(request: NextRequest) {
  try {
    // Try to authenticate to get user info for logging
    const authRequest = await authenticateRequest(request).catch(() => null);

    const refreshToken = await getRefreshToken();

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    // Log logout
    if (authRequest) {
      await logLogout(authRequest);
    }

    const response = successResponse(null, 'Logged out successfully');
    clearAuthCookies(response);

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
