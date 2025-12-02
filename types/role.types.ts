import { Permission } from './permission.types';

export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  hierarchy: number;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDTO {
  name: string;
  displayName: string;
  description: string;
  hierarchy: number;
  permissions: string[];
}

export interface UpdateRoleDTO {
  displayName?: string;
  description?: string;
  hierarchy?: number;
  permissions?: string[];
}
