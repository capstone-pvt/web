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
    const permissions = await this.findAll();
    const categorized: Record<string, IPermission[]> = {};
    permissions.forEach(p => {
      if (!categorized[p.category]) {
        categorized[p.category] = [];
      }
      categorized[p.category].push(p);
    });
    return categorized;
  }

  async update(id: string, data: Partial<IPermission>): Promise<IPermission | null> {
    await connectDB();
    return Permission.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await Permission.findByIdAndDelete(id);
    return !!result;
  }
}

export default new PermissionRepository();
