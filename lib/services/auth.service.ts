import { IUser } from '@/lib/db/models/User';
import UserRepository from '@/lib/repositories/user.repository';
import SessionRepository from '@/lib/repositories/session.repository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/utils/jwt';
import { UnauthorizedError, ConflictError } from '@/lib/utils/errors';
import { LoginCredentials, RegisterData } from '@/types/auth.types';
import bcrypt from 'bcryptjs';

class AuthService {
  async register(data: RegisterData): Promise<IUser> {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await UserRepository.create({
      ...data,
      roles: []
    });

    return user;
  }

  async login(credentials: LoginCredentials, deviceInfo: any): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await UserRepository.findByEmailWithPassword(credentials.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await UserRepository.updateLastLogin(user._id.toString(), deviceInfo.ip);

    await user.populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles.map((r: any) => r.name)
    });

    const refreshToken = generateRefreshToken(
      { userId: user._id.toString() },
      credentials.rememberMe || false
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await SessionRepository.create({
      userId: user._id,
      refreshToken: hashedRefreshToken,
      deviceInfo,
      expiresAt: new Date(Date.now() + (credentials.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000)
    });

    return { user, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    user: IUser;
    accessToken: string;
  }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const session = await SessionRepository.findByToken(hashedToken);
    if (!session || !session.isValid) {
      const sessions = await SessionRepository.findByUserId(payload.userId);
      let found = false;
      for (const sess of sessions) {
        const isMatch = await bcrypt.compare(refreshToken, sess.refreshToken);
        if (isMatch && sess.isValid) {
          found = true;
          break;
        }
      }
      if (!found) {
        throw new UnauthorizedError('Session expired');
      }
    }

    const user = await UserRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    await user.populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles.map((r: any) => r.name)
    });

    return { user, accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await SessionRepository.invalidateToken(hashedToken);
  }

  async getUserById(userId: string): Promise<IUser | null> {
    const user = await UserRepository.findById(userId);
    if (user) {
      await user.populate({
        path: 'roles',
        populate: { path: 'permissions' }
      });
    }
    return user;
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await SessionRepository.invalidateAllUserSessions(userId);
  }
}

export default new AuthService();
