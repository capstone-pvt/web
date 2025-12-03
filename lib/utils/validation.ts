import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(z.string()),
});

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  roles: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const createPermissionSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  resource: z.string(),
  action: z.string(),
  category: z.string(),
});

export const updatePermissionSchema = z.object({
  name: z.string().optional(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  category: z.string().optional(),
});

export const createRoleSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  hierarchy: z.number(),
  permissions: z.array(z.string()),
});

export const updateRoleSchema = z.object({
  displayName: z.string().optional(),
  description: z.string().optional(),
  hierarchy: z.number().optional(),
  permissions: z.array(z.string()).optional(),
});

export const updateSettingsSchema = z.object({
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
  jwt_access_token_secret: z.string().optional(),
  jwt_access_token_expires_in: z.string().optional(),
  jwt_refresh_token_secret: z.string().optional(),
  jwt_refresh_token_expires_in: z.string().optional(),
  maxLoginAttempts: z.number().optional(),
  lockoutDuration: z.number().optional(),
});
