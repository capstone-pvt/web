import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { ApiResponse } from '@/types/api.types';

export function successResponse<T>(data: T, message?: string, status: number = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  return NextResponse.json(response, { status });
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
    return NextResponse.json(response, { status: error.statusCode });
  }

  console.error('Unhandled error:', error);

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  };
  return NextResponse.json(response, { status: 500 });
}
