'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { PERMISSIONS } from '@/config/permissions';

export default function ProfileGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || !user) return;

    // Admins are exempt from profile completion
    const isAdmin =
      hasPermission(PERMISSIONS.USERS_READ) ||
      hasPermission(PERMISSIONS.ROLES_READ) ||
      hasPermission(PERMISSIONS.SETTINGS_MANAGE);

    if (isAdmin) return;

    // Already on the complete-profile page
    if (pathname === '/dashboard/complete-profile') return;

    // Check if required profile fields are missing
    const isProfileIncomplete =
      !user.department || !user.studentId || !user.gradeLevel || !user.adviser;

    if (isProfileIncomplete) {
      router.push('/dashboard/complete-profile');
    }
  }, [user, isLoading, hasPermission, pathname, router]);

  return <>{children}</>;
}
