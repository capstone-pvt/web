import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  onIdle: () => void;
  idleTime: number; // in milliseconds
  enabled?: boolean;
}

/**
 * Hook to track user idle time and trigger a callback when idle
 * Tracks mouse movements, clicks, keyboard events, touch events, and scroll events
 */
export function useIdleTimeout({ onIdle, idleTime, enabled = true }: UseIdleTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout only if enabled
    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        onIdle();
      }, idleTime);
    }
  }, [onIdle, idleTime, enabled]);

  useEffect(() => {
    if (!enabled) {
      // Clear timeout if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // List of events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer, enabled]);

  return {
    resetTimer,
    getLastActivityTime: () => lastActivityRef.current,
  };
}
