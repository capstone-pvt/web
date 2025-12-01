import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import { registerSchema } from '@/lib/utils/validation';
import { ValidationError } from '@/lib/utils/errors';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { registerRateLimit } from '@/lib/middleware/rateLimit.middleware';

export async function POST(request: NextRequest) {
  try {
    await registerRateLimit(request);

    const body = await request.json();

    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Validation failed', validationResult.error.errors);
    }

    const userData = validationResult.data;

    const user = await AuthService.register(userData);

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      roles: user.roles
    };

    return successResponse(
      { user: userResponse },
      'Registration successful',
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
