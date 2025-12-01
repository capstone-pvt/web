import User, { IUser } from '@/lib/db/models/User';
import Role from '@/lib/db/models/Role';
import connectDB from '@/lib/db/mongodb';
import { CreateUserDTO, UpdateUserDTO, UserFilters } from '@/types/user.types';

class UserRepository {
  async create(data: CreateUserDTO): Promise<IUser> {
    await connectDB();

    let roleIds = data.roles;
    if (!roleIds || roleIds.length === 0) {
      const defaultRole = await Role.findOne({ name: 'user' });
      roleIds = defaultRole ? [defaultRole._id.toString()] : [];
    }

    const user = await User.create({
      ...data,
      roles: roleIds
    });

    await user.populate('roles');
    return user;
  }

  async findById(id: string): Promise<IUser | null> {
    await connectDB();
    return User.findById(id).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ email }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ email }).select('+password').populate('roles');
  }

  async findAll(filters: UserFilters = {}): Promise<{ users: IUser[]; total: number }> {
    await connectDB();

    const {
      search,
      role,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = filters;

    const query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    const userQuery = User.find(query)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' }
      })
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const users = await userQuery;
    const total = await User.countDocuments(query);

    let filteredUsers = users;
    if (role) {
      filteredUsers = users.filter((user: any) =>
        user.roles.some((r: any) => r.name === role)
      );
    }

    return { users: filteredUsers, total };
  }

  async update(id: string, data: UpdateUserDTO): Promise<IUser | null> {
    await connectDB();
    return User.findByIdAndUpdate(id, data, { new: true }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async updateLastLogin(id: string, ip: string): Promise<void> {
    await connectDB();
    await User.findByIdAndUpdate(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip
    });
  }

  async count(filters: UserFilters = {}): Promise<number> {
    await connectDB();
    const query: any = {};

    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (typeof filters.isActive === 'boolean') {
      query.isActive = filters.isActive;
    }

    return User.countDocuments(query);
  }
}

export default new UserRepository();
