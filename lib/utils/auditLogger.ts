import { NextRequest } from 'next/server';
import AuditLogService from '../services/auditLog.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Extract IP address from request
 */
export function getIpAddress(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Extract device info from request
 */
export function getDeviceInfo(request: NextRequest): {
  ipAddress: string;
  userAgent: string;
} {
  return {
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request)
  };
}

/**
 * Log an authenticated action
 */
export async function logAuthenticatedAction(
  request: AuthenticatedRequest,
  action: string,
  resource: string,
  options?: {
    resourceId?: string;
    details?: Record<string, any>;
    status?: 'success' | 'failure';
    errorMessage?: string;
  }
): Promise<void> {
  if (!request.user) {
    console.error('Attempted to log action for unauthenticated request');
    return;
  }

  const deviceInfo = getDeviceInfo(request);

  await AuditLogService.log({
    userId: request.user.userId,
    userEmail: request.user.email,
    userName: request.user.email, // Will be updated when we have full name in JWT
    action,
    resource,
    resourceId: options?.resourceId,
    details: options?.details,
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent,
    status: options?.status || 'success',
    errorMessage: options?.errorMessage
  });
}

/**
 * Log a login attempt
 */
export async function logLogin(
  request: NextRequest,
  email: string,
  success: boolean,
  userId?: string,
  errorMessage?: string
): Promise<void> {
  const deviceInfo = getDeviceInfo(request);

  await AuditLogService.log({
    userId: userId || 'unknown',
    userEmail: email,
    userName: email,
    action: 'auth.login',
    resource: 'auth',
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent,
    status: success ? 'success' : 'failure',
    errorMessage
  });
}

/**
 * Log a logout
 */
export async function logLogout(
  request: AuthenticatedRequest
): Promise<void> {
  if (!request.user) return;

  const deviceInfo = getDeviceInfo(request);

  await AuditLogService.log({
    userId: request.user.userId,
    userEmail: request.user.email,
    userName: request.user.email,
    action: 'auth.logout',
    resource: 'auth',
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent,
    status: 'success'
  });
}

/**
 * Log a registration
 */
export async function logRegistration(
  request: NextRequest,
  email: string,
  userId: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const deviceInfo = getDeviceInfo(request);

  await AuditLogService.log({
    userId,
    userEmail: email,
    userName: email,
    action: 'auth.register',
    resource: 'auth',
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent,
    status: success ? 'success' : 'failure',
    errorMessage
  });
}

/**
 * Create a wrapper for actions that automatically logs them
 */
export function withAuditLog<T>(
  request: AuthenticatedRequest,
  action: string,
  resource: string,
  fn: () => Promise<T>,
  options?: {
    getResourceId?: (result: T) => string;
    getDetails?: (result: T) => Record<string, any>;
  }
): Promise<T> {
  return fn()
    .then(async (result) => {
      await logAuthenticatedAction(request, action, resource, {
        resourceId: options?.getResourceId?.(result),
        details: options?.getDetails?.(result),
        status: 'success'
      });
      return result;
    })
    .catch(async (error) => {
      await logAuthenticatedAction(request, action, resource, {
        status: 'failure',
        errorMessage: error.message
      });
      throw error;
    });
}
