'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '@/lib/api/axios';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthUser, LoginCredentials, RegisterData } from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{
  children: React.ReactNode
}>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      if (response.data.success) {
        setUser(response.data.data.user);
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post('/api/auth/register', data);
      if (response.data.success) {
        // After registration, login automatically
        await login({ email: data.email, password: data.password });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.some(p => p.name === permission);
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
