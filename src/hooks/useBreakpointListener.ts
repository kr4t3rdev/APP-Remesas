import { useEffect, useCallback, useRef } from "react";
import { useResponsive, Breakpoint } from "./useResponsive";

type BreakpointListener = (
  breakpoint: Breakpoint,
  prevBreakpoint: Breakpoint,
) => void;

/**
 * Hook that notifies listeners when breakpoint changes
 * Allows other hooks (like useDashboardData) to refetch/adjust on breakpoint changes
 */
export const useBreakpointListener = (
  onBreakpointChange: BreakpointListener,
  deps: React.DependencyList = [],
) => {
  const { breakpoint } = useResponsive();
  const prevBreakpointRef = useRef<Breakpoint>(breakpoint);
  const callbacksRef = useRef<BreakpointListener[]>([]);

  // Register the callback
  useEffect(() => {
    callbacksRef.current.push(onBreakpointChange);

    return () => {
      callbacksRef.current = callbacksRef.current.filter(
        (cb) => cb !== onBreakpointChange,
      );
    };
  }, [onBreakpointChange, ...deps]);

  // Notify all listeners when breakpoint changes
  useEffect(() => {
    if (prevBreakpointRef.current !== breakpoint) {
      const prev = prevBreakpointRef.current;
      prevBreakpointRef.current = breakpoint;

      // Call all registered listeners
      callbacksRef.current.forEach((cb) => {
        try {
          cb(breakpoint, prev);
        } catch (error) {
          console.warn("BreakpointListener error:", error);
        }
      });
    }
  }, [breakpoint]);

  // Return a function to manually trigger change notification
  const forceRefresh = useCallback(() => {
    callbacksRef.current.forEach((cb) => {
      try {
        cb(breakpoint, prevBreakpointRef.current);
      } catch (error) {
        console.warn("BreakpointListener error:", error);
      }
    });
  }, [breakpoint]);

  return { forceRefresh };
};

// Singleton store for breakpoint listeners (for non-hook contexts)
class BreakpointNotifier {
  private listeners: Set<BreakpointListener> = new Set();
  private currentBreakpoint: Breakpoint = "mobile";
  private prevBreakpoint: Breakpoint = "mobile";

  subscribe(listener: BreakpointListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.currentBreakpoint, this.prevBreakpoint);

    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(breakpoint: Breakpoint) {
    if (breakpoint !== this.currentBreakpoint) {
      this.prevBreakpoint = this.currentBreakpoint;
      this.currentBreakpoint = breakpoint;

      this.listeners.forEach((listener) => {
        try {
          listener(breakpoint, this.prevBreakpoint);
        } catch (error) {
          console.warn("BreakpointNotifier error:", error);
        }
      });
    }
  }

  getCurrentBreakpoint(): Breakpoint {
    return this.currentBreakpoint;
  }
}

// Singleton instance
export const breakpointNotifier = new BreakpointNotifier();

// Hook to use the singleton notifier
export const useBreakpointNotifier = (
  onBreakpointChange: BreakpointListener,
  deps: React.DependencyList = [],
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callbackRef = useRef(onBreakpointChange);

  useEffect(() => {
    callbackRef.current = onBreakpointChange;
  }, [onBreakpointChange]);

  useEffect(() => {
    const unsubscribe = breakpointNotifier.subscribe(callbackRef.current);
    return unsubscribe;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useBreakpointListener;
