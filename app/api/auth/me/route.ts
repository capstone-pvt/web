import { NextRequest } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authRequest = await authenticateRequest(request);

    const user = await AuthService.getUserById(authRequest.user!.userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Extract only permission names as an array of strings
    const permissions = user.roles.flatMap((role: unknown) => {
      const r = role as { permissions?: unknown[] };
      return (r.permissions || []).map((p: unknown) => {
        const perm = p as { name: string };
        return perm.name;
      });
    });

    const userResponse = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      roles: user.roles.map((r: unknown) => {
        const role = r as { _id: { toString: () => string }; name: string; displayName: string; description: string; hierarchy: number };
        return {
          _id: role._id.toString(),
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          hierarchy: role.hierarchy
        };
      }),
      permissions // Now an array of strings
    };

    return successResponse({ user: userResponse });
  } catch (error) {
    return errorResponse(error);
  }
}
