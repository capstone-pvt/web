import { NextRequest } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import { registerSchema } from '@/lib/utils/validation';
import { ValidationError } from '@/lib/utils/errors';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { registerRateLimit } from '@/lib/middleware/rateLimit.middleware';
import { logRegistration } from '@/lib/utils/auditLogger';

export async function POST(request: NextRequest) {
  let email: string | undefined;

  try {
    await registerRateLimit(request);

    const body = await request.json();
    email = body.email; // Store email for error logging

    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Validation failed', validationResult.error.errors);
    }

    const userData = validationResult.data;

    const user = await AuthService.register(userData);

    // Log successful registration
    await logRegistration(request, user.email, user._id.toString(), true);

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
    // Log failed registration
    if (email) {
      const err = error as { message?: string };
      await logRegistration(request, email, 'unknown', false, err.message);
    }
    return errorResponse(error);
  }
}
