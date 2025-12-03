import Setting, { ISetting } from '@/lib/db/models/Setting';
import connectDB from '@/lib/db/mongodb';

export async function seedSettings() {
  await connectDB();

  const existingSettings = await Setting.findOne();

  if (!existingSettings) {
    console.log('Seeding default settings...');
    const defaultSettings: Partial<ISetting> = {
      appName: 'RBAC App',
      appLogo: '',
      companyName: 'My Company',
      companyLogo: '',
      jwt_access_token_secret: 'supersecretjwtaccesskey', // IMPORTANT: Change this in production
      jwt_access_token_expires_in: '15m',
      jwt_refresh_token_secret: 'supersecretjwtrefreshkey', // IMPORTANT: Change this in production
      jwt_refresh_token_expires_in: '7d',
      maxLoginAttempts: 5,
      lockoutDuration: 15, // in minutes
    };

    await Setting.create(defaultSettings);
    console.log('Default settings seeded successfully.');
  } else {
    console.log('Settings already exist, skipping seeding.');
  }
}
