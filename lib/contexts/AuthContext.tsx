'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/lib/api';
import { settingsApi } from '@/lib/api/settings.api';
import { AuthContextType, AuthUser, LoginCredentials, RegisterData } from '@/types/auth.types';
import { useIdleTimeout } from '@/lib/hooks/useIdleTimeout';
import { useSessionAlert } from '@/lib/contexts/SessionAlertContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{
  children: React.ReactNode
}>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<number>(5); // Default 5 minutes
  const router = useRouter();
  const pathname = usePathname();
  const { showIdleAlert } = useSessionAlert();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { user: userData } = await authApi.me();
      const authUser: AuthUser = {
        ...userData,
        fullName: `${userData.firstName} ${userData.lastName}`,
      };
      setUser(authUser);
    } catch (error) {
      setUser(null);
      // Only redirect if not on a public page
      const currentPath = pathnameRef.current;
      if (currentPath !== '/login' && currentPath !== '/register') {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Fetch session timeout from settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { settings } = await settingsApi.get();
        if (settings?.sessionTimeout) {
          setSessionTimeout(settings.sessionTimeout);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const logout = useCallback(async (isAutoLogout = false) => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      if (isAutoLogout) {
        router.push('/login?reason=idle');
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  // Handle idle timeout
  const handleIdle = useCallback(() => {
    if (user) {
      console.log('User has been idle for too long. Logging out...');
      showIdleAlert(() => {
        logout(true);
      });
    }
  }, [user, logout, showIdleAlert]);

  // Enable idle timeout only when user is authenticated and not on public pages
  const isPublicPage = pathname === '/login' || pathname === '/register';
  const shouldEnableIdleTimeout = !!user && !isPublicPage;

  useIdleTimeout({
    onIdle: handleIdle,
    idleTime: sessionTimeout * 60 * 1000, // Convert minutes to milliseconds
    enabled: shouldEnableIdleTimeout,
  });

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      await authApi.login(credentials);
      await refreshUser();
      router.push('/dashboard');
    } catch (err) {
      const error = err as Error;
      setIsLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authApi.register(data);
      await login({ email: data.email, password: data.password });
    } catch (err) {
      const error = err as Error;
      throw new Error(error.message || 'Registration failed');
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.some(r => r.name === role);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
