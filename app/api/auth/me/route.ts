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
    const permissions = user.roles.flatMap((role: any) =>
      (role.permissions || []).map((p: any) => p.name)
    );

    const userResponse = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      roles: user.roles.map((r: any) => ({
        _id: r._id.toString(),
        name: r.name,
        displayName: r.displayName,
        description: r.description,
        hierarchy: r.hierarchy
      })),
      permissions // Now an array of strings
    };

    return successResponse({ user: userResponse });
  } catch (error) {
    return errorResponse(error);
  }
}
