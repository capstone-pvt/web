import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ValidationError } from '@/lib/utils/errors';

export function validateBody(schema: ZodSchema) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      schema.parse(body);
      // If validation is successful, we need to "give back" the request so the next middleware or the route handler can use it.
      // A simple way is to return a new Request object with the parsed body, but that's complex.
      // A common pattern is to attach the parsed body to the request object if the environment allows,
      // but Next.js middleware runs in a limited environment.
      // For API routes, we can read the body again. This is slightly inefficient but simple.
      return null;
    } catch (error: any) {
      const validationError = fromZodError(error);
      return new ValidationError(validationError.message, validationError.details);
    }
  };
}
