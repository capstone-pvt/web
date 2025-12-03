import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ValidationError } from '@/lib/utils/errors';

export function validateBody(schema: ZodSchema) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      schema.parse(body);
      return { data: body, error: null };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        return { data: null, error: new ValidationError(validationError.message, validationError.details) };
      }
      return { data: null, error: new ValidationError('Invalid request body. Please check the JSON format.') };
    }
  };
}
