import { renderHook, act } from '@testing-library/react-native';
import React from 'react';

// Mock useWindowDimensions before importing the hook
const mockUseWindowDimensions = jest.fn();

jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    ...actualReactNative,
    useWindowDimensions: () => mockUseWindowDimensions(),
  };
});

import { useResponsive, BREAKPOINTS, type Breakpoint } from '../useResponsive';

describe('useResponsive', () => {
  beforeEach(() => {
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('breakpoint detection', () => {
    it('returns mobile for width < 640', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isWide).toBe(false);
    });

    it('returns mobile for width = 639', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 639, height: 812 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
    });

    it('returns tablet for width >= 640 and < 1024', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 768, height: 1024 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it('returns desktop for width >= 1024 and < 1440', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 1280, height: 800 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.breakpoint).toBe('desktop');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isWide).toBe(false);
    });

    it('returns wide for width >= 1440', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 1920, height: 1080 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.breakpoint).toBe('wide');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isWide).toBe(true);
    });
  });

  describe('touch device detection', () => {
    it('returns isTouchDevice true for mobile width', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.isTouchDevice).toBe(true);
      expect(result.current.shouldShowSidebar).toBe(false);
      expect(result.current.shouldShowBottomTabs).toBe(true);
    });

    it('returns isTouchDevice false for tablet width', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 768, height: 1024 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.isTouchDevice).toBe(false);
      expect(result.current.shouldShowSidebar).toBe(true);
      expect(result.current.shouldShowBottomTabs).toBe(false);
    });
  });

  describe('sidebar mode', () => {
    it('returns collapsed for tablet', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 768, height: 1024 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.sidebarMode).toBe('collapsed');
    });

    it('returns expanded for desktop', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 1280, height: 800 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.sidebarMode).toBe('expanded');
    });

    it('returns expanded for wide', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 1920, height: 1080 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.sidebarMode).toBe('expanded');
    });
  });

  describe('dimensions', () => {
    it('returns correct width and height', () => {
      mockUseWindowDimensions.mockReturnValue({ width: 1024, height: 768 });
      
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
    });
  });

  describe('BREAKPOINTS constants', () => {
    it('has correct breakpoint values', () => {
      expect(BREAKPOINTS.mobile).toBe(0);
      expect(BREAKPOINTS.tablet).toBe(640);
      expect(BREAKPOINTS.desktop).toBe(1024);
      expect(BREAKPOINTS.wide).toBe(1440);
    });
  });

  describe('boundary conditions', () => {
    it('transitions from mobile to tablet at boundary', async () => {
      mockUseWindowDimensions.mockReturnValue({ width: 639, height: 812 });
      
      const { result, rerender } = renderHook(() => useResponsive());
      
      expect(result.current.breakpoint).toBe('mobile');
      
      // Simulate resize to tablet
      mockUseWindowDimensions.mockReturnValue({ width: 640, height: 812 });
      
      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      rerender();
      
      expect(result.current.breakpoint).toBe('tablet');
    });

    it('transitions from tablet to desktop at boundary', async () => {
      mockUseWindowDimensions.mockReturnValue({ width: 1023, height: 800 });
      
      const { result, rerender } = renderHook(() => useResponsive());
      
      expect(result.current.breakpoint).toBe('tablet');
      
      // Simulate resize to desktop
      mockUseWindowDimensions.mockReturnValue({ width: 1024, height: 800 });
      
      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      rerender();
      
      expect(result.current.breakpoint).toBe('desktop');
    });
  });
});
