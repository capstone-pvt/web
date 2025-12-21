'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { toast } from 'sonner';
import LoginForm from '@/app/components/auth/LoginForm';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show notification if logged out due to inactivity
    const reason = searchParams.get('reason');
    if (reason === 'idle') {
      toast.warning('You have been logged out due to inactivity. Please log in again.');
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Please enter your credentials
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <LoginForm />
      </div>
    </div>
  );
}
