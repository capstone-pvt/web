import { IRole } from '@/lib/db/models/Role';
import RoleRepository from '@/lib/repositories/role.repository';
import { CreateRoleDTO, UpdateRoleDTO } from '@/types/role.types';
import { NotFoundError } from '@/lib/utils/errors';

class RoleService {
  async createRole(data: CreateRoleDTO): Promise<IRole> {
    return RoleRepository.create(data);
  }

  async getRoleById(id: string): Promise<IRole> {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return role;
  }

  async getRoleByName(name: string): Promise<IRole | null> {
    return RoleRepository.findByName(name);
  }

  async getAllRoles(): Promise<IRole[]> {
    return RoleRepository.findAll();
  }

  async updateRole(id: string, data: UpdateRoleDTO): Promise<IRole> {
    const role = await RoleRepository.update(id, data);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    const deleted = await RoleRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Role');
    }
  }

  async addPermissionsToRole(roleId: string, permissionIds: string[]): Promise<IRole> {
    const role = await RoleRepository.addPermissions(roleId, permissionIds);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return role;
  }

  async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<IRole> {
    const role = await RoleRepository.removePermissions(roleId, permissionIds);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return role;
  }
}

export default new RoleService();
