import Role, { IRole } from '@/lib/db/models/Role';
import connectDB from '@/lib/db/mongodb';
import { CreateRoleDTO, UpdateRoleDTO } from '@/types/role.types';

class RoleRepository {
  async create(data: CreateRoleDTO): Promise<IRole> {
    await connectDB();
    const role = await Role.create(data);
    await role.populate('permissions');
    return role;
  }

  async findById(id: string): Promise<IRole | null> {
    await connectDB();
    return Role.findById(id).populate('permissions');
  }

  async findByName(name: string): Promise<IRole | null> {
    await connectDB();
    return Role.findOne({ name }).populate('permissions');
  }

  async findAll(): Promise<IRole[]> {
    await connectDB();
    return Role.find().populate('permissions').sort({ hierarchy: 1 });
  }

  async update(id: string, data: UpdateRoleDTO): Promise<IRole | null> {
    await connectDB();
    return Role.findByIdAndUpdate(id, data, { new: true }).populate('permissions');
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const role = await Role.findById(id);
    if (role?.isSystemRole) {
      throw new Error('Cannot delete system role');
    }
    const result = await Role.findByIdAndDelete(id);
    return !!result;
  }

  async addPermissions(roleId: string, permissionIds: string[]): Promise<IRole | null> {
    await connectDB();
    return Role.findByIdAndUpdate(
      roleId,
      { $addToSet: { permissions: { $each: permissionIds } } },
      { new: true }
    ).populate('permissions');
  }

  async removePermissions(roleId: string, permissionIds: string[]): Promise<IRole | null> {
    await connectDB();
    return Role.findByIdAndUpdate(
      roleId,
      { $pull: { permissions: { $in: permissionIds } } },
      { new: true }
    ).populate('permissions');
  }
}

export default new RoleRepository();
