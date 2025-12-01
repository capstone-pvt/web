import Session, { ISession } from '@/lib/db/models/Session';
import connectDB from '@/lib/db/mongodb';
import { Types } from 'mongoose';

class SessionRepository {
  async create(data: {
    userId: Types.ObjectId | string;
    refreshToken: string;
    deviceInfo: any;
    expiresAt: Date;
  }): Promise<ISession> {
    await connectDB();
    return Session.create(data);
  }

  async findByToken(refreshToken: string): Promise<ISession | null> {
    await connectDB();
    return Session.findOne({ refreshToken, isValid: true });
  }

  async findByUserId(userId: string): Promise<ISession[]> {
    await connectDB();
    return Session.find({ userId, isValid: true });
  }

  async invalidateToken(refreshToken: string): Promise<boolean> {
    await connectDB();
    const result = await Session.updateOne(
      { refreshToken },
      { isValid: false }
    );
    return result.modifiedCount > 0;
  }

  async invalidateAllUserSessions(userId: string): Promise<boolean> {
    await connectDB();
    const result = await Session.updateMany(
      { userId, isValid: true },
      { isValid: false }
    );
    return result.modifiedCount > 0;
  }

  async deleteExpiredSessions(): Promise<number> {
    await connectDB();
    const result = await Session.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount || 0;
  }
}

export default new SessionRepository();
