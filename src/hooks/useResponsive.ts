import { useWindowDimensions } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * Custom hook for responsive breakpoint detection
 * Debounces resize events to prevent excessive re-renders
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('mobile');

  const calculateBreakpoint = useCallback((w: number): Breakpoint => {
    if (w >= BREAKPOINTS.wide) return 'wide';
    if (w >= BREAKPOINTS.desktop) return 'desktop';
    if (w >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
  }, []);

  useEffect(() => {
    // Debounce resize events by 100ms
    const timeoutId = setTimeout(() => {
      const newBreakpoint = calculateBreakpoint(width);
      setBreakpoint(newBreakpoint);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [width, calculateBreakpoint]);

  // Initialize breakpoint on mount
  useEffect(() => {
    setBreakpoint(calculateBreakpoint(width));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return useMemo(() => ({
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
    isWide: breakpoint === 'wide',
    isTouchDevice: width < BREAKPOINTS.tablet,
    width,
    height,
    // Sidebar related
    shouldShowSidebar: width >= BREAKPOINTS.tablet,
    shouldShowBottomTabs: width < BREAKPOINTS.tablet,
    sidebarMode: width >= BREAKPOINTS.desktop ? 'expanded' : 'collapsed',
  }), [breakpoint, width, height]);
};

export default useResponsive;
