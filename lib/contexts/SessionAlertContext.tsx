'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { AlertTriangle, LogOut } from 'lucide-react';
import { setGlobalSessionAlertHandler } from '@/lib/api/axios';

interface SessionAlert {
  type: 'idle' | 'device' | 'expired';
  title: string;
  message: string;
  onConfirm: () => void;
}

interface SessionAlertContextType {
  showIdleAlert: (onConfirm: () => void) => void;
  showDeviceAlert: (onConfirm: () => void) => void;
  showExpiredAlert: (onConfirm: () => void) => void;
}

const SessionAlertContext = createContext<SessionAlertContextType | undefined>(undefined);

export function SessionAlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<SessionAlert | null>(null);
  const router = useRouter();

  const showIdleAlert = useCallback((onConfirm: () => void) => {
    setAlert({
      type: 'idle',
      title: 'Session Expired',
      message: 'You have been logged out due to inactivity. Please log in again to continue.',
      onConfirm,
    });
  }, []);

  const showDeviceAlert = useCallback((onConfirm: () => void) => {
    setAlert({
      type: 'device',
      title: 'Logged In From Another Device',
      message: 'Your account has been accessed from another device. For security reasons, you have been logged out from this session.',
      onConfirm,
    });
  }, []);

  const showExpiredAlert = useCallback((onConfirm: () => void) => {
    setAlert({
      type: 'expired',
      title: 'Session Expired',
      message: 'Your session has expired. Please log in again to continue.',
      onConfirm,
    });
  }, []);

  // Register global session alert handler for axios interceptor
  useEffect(() => {
    setGlobalSessionAlertHandler((type) => {
      if (type === 'device') {
        showDeviceAlert(() => {
          router.push('/login');
        });
      } else if (type === 'expired') {
        showExpiredAlert(() => {
          router.push('/login');
        });
      }
    });

    return () => {
      setGlobalSessionAlertHandler(() => {});
    };
  }, [router, showDeviceAlert, showExpiredAlert]);

  const handleConfirm = () => {
    if (alert) {
      alert.onConfirm();
      setAlert(null);
    }
  };

  const getIcon = () => {
    if (!alert) return null;

    switch (alert.type) {
      case 'idle':
        return <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />;
      case 'device':
        return <LogOut className="h-12 w-12 text-red-500 mx-auto mb-4" />;
      case 'expired':
        return <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />;
      default:
        return null;
    }
  };

  return (
    <SessionAlertContext.Provider value={{ showIdleAlert, showDeviceAlert, showExpiredAlert }}>
      {children}

      <Dialog open={!!alert} onOpenChange={(open) => !open && setAlert(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            {getIcon()}
            <DialogTitle className="text-center text-xl">{alert?.title}</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              {alert?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button
              onClick={handleConfirm}
              className="w-full sm:w-auto min-w-[120px]"
              variant={alert?.type === 'device' ? 'destructive' : 'default'}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SessionAlertContext.Provider>
  );
}

export function useSessionAlert() {
  const context = useContext(SessionAlertContext);
  if (context === undefined) {
    throw new Error('useSessionAlert must be used within a SessionAlertProvider');
  }
  return context;
}
