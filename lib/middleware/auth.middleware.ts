import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/utils/jwt';
import { getAccessToken } from '@/lib/utils/cookies';
import { UnauthorizedError } from '@/lib/utils/errors';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedRequest> {
  const token = await getAccessToken();

  if (!token) {
    throw new UnauthorizedError('No authentication token provided');
  }

  try {
    const payload = verifyAccessToken(token);
    (request as AuthenticatedRequest).user = {
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles
    };
    return request as AuthenticatedRequest;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function getRequestIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

export function getDeviceInfo(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';

  return {
    userAgent,
    ip: getRequestIP(request),
    browser: extractBrowser(userAgent),
    os: extractOS(userAgent)
  };
}

function extractBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function extractOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}
