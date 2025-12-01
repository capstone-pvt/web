import { NextRequest } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { clearAuthCookies, getRefreshToken } from '@/lib/utils/cookies';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = await getRefreshToken();

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    const response = successResponse(null, 'Logged out successfully');
    clearAuthCookies(response);

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
