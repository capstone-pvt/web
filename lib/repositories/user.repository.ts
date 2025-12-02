import User, { IUser } from '@/lib/db/models/User';
import Role from '@/lib/db/models/Role';
import connectDB from '@/lib/db/mongodb';
import { CreateUserDTO, UpdateUserDTO, UserFilters } from '@/types/user.types';
import { Types } from 'mongoose';

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
    const user = await User.findById(id).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });
    return user;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    const user = await User.findOne({ email }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });
    return user;
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    await connectDB();
    const user = await User.findOne({ email }).select('+password').populate('roles');
    return user;
  }

  async findAll(filters: UserFilters = {}): Promise<{ users: IUser[]; totalPages: number }> {
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

    return { users: filteredUsers, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: UpdateUserDTO): Promise<IUser | null> {
    await connectDB();
    const user = await User.findByIdAndUpdate(id, data, { new: true }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });
    return user;
  }

  async updateRoles(userId: string, roleIds: string[]): Promise<IUser | null> {
    await connectDB();
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { roles: roleIds.map(id => new Types.ObjectId(id)) } },
      { new: true }
    ).populate('roles');
    return user;
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
