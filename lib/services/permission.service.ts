import { IPermission } from '@/lib/db/models/Permission';
import PermissionRepository from '@/lib/repositories/permission.repository';

class PermissionService {
  async getAllPermissions(): Promise<IPermission[]> {
    return PermissionRepository.findAll();
  }

  async getPermissionsByCategory(category: string): Promise<IPermission[]> {
    return PermissionRepository.findByCategory(category);
  }

  async getAllCategorized(): Promise<Record<string, IPermission[]>> {
    return PermissionRepository.getAllCategorized();
  }

  async getPermissionById(id: string): Promise<IPermission | null> {
    return PermissionRepository.findById(id);
  }

  async getPermissionByName(name: string): Promise<IPermission | null> {
    return PermissionRepository.findByName(name);
  }
}

export default new PermissionService();
