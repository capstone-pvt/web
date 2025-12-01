import Permission, { IPermission } from '@/lib/db/models/Permission';
import connectDB from '@/lib/db/mongodb';

class PermissionRepository {
  async create(data: Partial<IPermission>): Promise<IPermission> {
    await connectDB();
    return Permission.create(data);
  }

  async findById(id: string): Promise<IPermission | null> {
    await connectDB();
    return Permission.findById(id);
  }

  async findByName(name: string): Promise<IPermission | null> {
    await connectDB();
    return Permission.findOne({ name });
  }

  async findAll(): Promise<IPermission[]> {
    await connectDB();
    return Permission.find().sort({ category: 1, name: 1 });
  }

  async findByCategory(category: string): Promise<IPermission[]> {
    await connectDB();
    return Permission.find({ category }).sort({ name: 1 });
  }

  async findByIds(ids: string[]): Promise<IPermission[]> {
    await connectDB();
    return Permission.find({ _id: { $in: ids } });
  }

  async getAllCategorized(): Promise<Record<string, IPermission[]>> {
    await connectDB();
    const permissions = await Permission.find().sort({ category: 1, name: 1 });

    const categorized: Record<string, IPermission[]> = {};
    permissions.forEach(permission => {
      if (!categorized[permission.category]) {
        categorized[permission.category] = [];
      }
      categorized[permission.category].push(permission);
    });

    return categorized;
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const permission = await Permission.findById(id);
    if (permission?.isSystemPermission) {
      throw new Error('Cannot delete system permission');
    }
    const result = await Permission.findByIdAndDelete(id);
    return !!result;
  }
}

export default new PermissionRepository();
