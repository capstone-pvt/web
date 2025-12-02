import { IUser } from '@/lib/db/models/User';
import UserRepository from '@/lib/repositories/user.repository';
import { CreateUserDTO, UpdateUserDTO, UserFilters } from '@/types/user.types';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

class UserService {
  async createUser(data: CreateUserDTO, currentUserId: string): Promise<IUser> {
    const currentUser = await UserRepository.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundError('Current user');
    }

    const canCreate = await currentUser.hasPermission('users.create');
    if (!canCreate) {
      throw new ForbiddenError('No permission to create users');
    }

    return UserRepository.create(data);
  }

  async getUserById(id: string): Promise<IUser | null> {
    return UserRepository.findById(id);
  }

  async getAllUsers(filters: UserFilters): Promise<{ users: IUser[]; totalPages: number }> {
    return UserRepository.findAll(filters);
  }

  async updateUser(id: string, data: UpdateUserDTO, currentUserId: string): Promise<IUser> {
    const currentUser = await UserRepository.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundError('Current user');
    }

    const targetUser = await UserRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundError('User');
    }

    if (currentUserId !== id) {
      const canUpdate = await currentUser.hasPermission('users.update');
      if (!canUpdate) {
        throw new ForbiddenError('No permission to update users');
      }
    }

    const updatedUser = await UserRepository.update(id, data);
    if (!updatedUser) {
      throw new NotFoundError('User');
    }

    return updatedUser;
  }

  async deleteUser(id: string, currentUserId: string): Promise<void> {
    if (currentUserId === id) {
      throw new ForbiddenError('Cannot delete your own account');
    }

    const currentUser = await UserRepository.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundError('Current user');
    }

    const canDelete = await currentUser.hasPermission('users.delete');
    if (!canDelete) {
      throw new ForbiddenError('No permission to delete users');
    }

    const targetUser = await UserRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundError('User');
    }

    await UserRepository.delete(id);
  }

  async getUserCount(filters: UserFilters = {}): Promise<number> {
    return UserRepository.count(filters);
  }
}

export default new UserService();
