import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/utils/jwt';
import { getAccessToken } from '@/lib/utils/cookies';
import { UnauthorizedError } from '@/lib/utils/errors';
import AuthService from '@/lib/services/auth.service'; // Import AuthService

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    permissions: string[]; // Add permissions here
  };
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedRequest> {
  const token = await getAccessToken();

  if (!token) {
    throw new UnauthorizedError('No authentication token provided');
  }

  try {
    const payload = verifyAccessToken(token);
    
    // Fetch the full user object with populated roles and permissions
    const user = await AuthService.getUserById(payload.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Extract permission names
    const userPermissions = user.roles.flatMap((role: unknown) => {
      const r = role as { permissions: unknown[] };
      return r.permissions.map((p: unknown) => {
        const perm = p as { name: string };
        return perm.name;
      });
    });

    (request as AuthenticatedRequest).user = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles.map((r: unknown) => {
        const role = r as { name: string };
        return role.name;
      }),
      permissions: userPermissions, // Assign extracted permissions
    };
    return request as AuthenticatedRequest;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export async function authorizeRequest(
  request: AuthenticatedRequest,
  requiredPermissions: string[]
): Promise<void> {
  if (!request.user) {
    throw new UnauthorizedError('Not authenticated');
  }

  if (requiredPermissions.length === 0) {
    return; // No specific permissions required, allow access
  }

  const userPermissions = request.user.permissions;

  const hasPermission = requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );

  if (!hasPermission) {
    throw new UnauthorizedError('Insufficient permissions');
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
