import Setting, { ISetting } from '@/lib/db/models/Setting';
import connectDB from '@/lib/db/mongodb';

class SettingRepository {
  async getSettings(): Promise<ISetting | null> {
    await connectDB();
    // There should only be one settings document
    return Setting.findOne();
  }

  async updateSettings(data: Partial<ISetting>): Promise<ISetting | null> {
    await connectDB();
    // Find the existing settings document and update it, or create it if it doesn't exist
    return Setting.findOneAndUpdate({}, data, { new: true, upsert: true });
  }
}

export default new SettingRepository();
