import mongoose from 'mongoose';
import connectDB from '../lib/db/mongodb';
import User from '../lib/db/models/User';
import Role from '../lib/db/models/Role';
import Permission from '../lib/db/models/Permission';
import { PERMISSIONS, PERMISSION_CATEGORIES } from '../config/permissions';
import { DEFAULT_ROLES } from '../config/roles';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});

    // Create permissions
    console.log('📝 Creating permissions...');
    const permissionDocs = await Permission.create(
      Object.entries(PERMISSIONS).map(([key, name]) => {
        const [resource, action] = name.split('.');
        return {
          name,
          displayName: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
          resource,
          action,
          category: getCategoryForPermission(name),
          isSystemPermission: true
        };
      })
    );

    console.log(`✅ Created ${permissionDocs.length} permissions`);

    // Create roles
    console.log('👥 Creating roles...');
    const roleDocs = await Promise.all(
      DEFAULT_ROLES.map(async (roleData) => {
        const permissionIds = permissionDocs
          .filter((p) => roleData.permissions.includes(p.name))
          .map((p) => p._id);

        return Role.create({
          ...roleData,
          permissions: permissionIds,
          isSystemRole: true
        });
      })
    );

    console.log(`✅ Created ${roleDocs.length} roles`);

    // Create admin user
    console.log('👑 Creating admin user...');
    const adminRole = roleDocs.find((r) => r.name === 'admin');
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'Admin@123',
      firstName: 'Admin',
      lastName: 'User',
      roles: [adminRole!._id],
      isActive: true,
      isEmailVerified: true
    });

    console.log(`✅ Created admin user: ${adminUser.email} (password: Admin@123)`);

    // Create manager user
    console.log('👔 Creating manager user...');
    const managerRole = roleDocs.find((r) => r.name === 'manager');
    const managerUser = await User.create({
      email: 'manager@example.com',
      password: 'Manager@123',
      firstName: 'Manager',
      lastName: 'User',
      roles: [managerRole!._id],
      isActive: true,
      isEmailVerified: true
    });

    console.log(`✅ Created manager user: ${managerUser.email} (password: Manager@123)`);

    // Create regular user
    console.log('👤 Creating regular user...');
    const userRole = roleDocs.find((r) => r.name === 'user');
    const regularUser = await User.create({
      email: 'user@example.com',
      password: 'User@123',
      firstName: 'Regular',
      lastName: 'User',
      roles: [userRole!._id],
      isActive: true,
      isEmailVerified: true
    });

    console.log(`✅ Created regular user: ${regularUser.email} (password: User@123)`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Permissions: ${permissionDocs.length}`);
    console.log(`   - Roles: ${roleDocs.length}`);
    console.log(`   - Users: 3 (admin, manager, user)`);
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin:   admin@example.com / Admin@123');
    console.log('   Manager: manager@example.com / Manager@123');
    console.log('   User:    user@example.com / User@123\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

function getCategoryForPermission(permission: string): string {
  if (permission.startsWith('users.')) return PERMISSION_CATEGORIES.USER_MANAGEMENT;
  if (permission.startsWith('roles.')) return PERMISSION_CATEGORIES.ROLE_MANAGEMENT;
  if (permission.startsWith('projects.')) return PERMISSION_CATEGORIES.PROJECT_MANAGEMENT;
  if (permission.startsWith('analytics.')) return PERMISSION_CATEGORIES.ANALYTICS;
  if (permission.startsWith('settings.')) return PERMISSION_CATEGORIES.SETTINGS;
  if (permission.startsWith('permissions.')) return PERMISSION_CATEGORIES.ROLE_MANAGEMENT;
  return 'Other';
}

seed();
