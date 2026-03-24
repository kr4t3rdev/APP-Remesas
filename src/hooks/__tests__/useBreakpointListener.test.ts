import { renderHook, act, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock useWindowDimensions
const mockUseWindowDimensions = jest.fn();

jest.mock("react-native", () => {
  const actualReactNative = jest.requireActual("react-native");
  return {
    ...actualReactNative,
    useWindowDimensions: () => mockUseWindowDimensions(),
  };
});

import {
  useBreakpointListener,
  useBreakpointNotifier,
  breakpointNotifier,
} from "../useBreakpointListener";
import { useResponsive, BREAKPOINTS, type Breakpoint } from "../useResponsive";

describe("useBreakpointListener", () => {
  beforeEach(() => {
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("basic functionality", () => {
    it("calls listener immediately with current breakpoint", () => {
      const callback = jest.fn();

      const { result } = renderHook(() => useBreakpointListener(callback));

      expect(callback).toHaveBeenCalledWith("mobile", "mobile");
    });

    it("calls listener when breakpoint changes", async () => {
      const callback = jest.fn();

      const { rerender } = renderHook(() => useBreakpointListener(callback));

      // Simulate resize to tablet
      mockUseWindowDimensions.mockReturnValue({ width: 768, height: 1024 });

      // Advance timers to trigger debounce
      act(() => {
        jest.advanceTimersByTime(150);
      });

      rerender();

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith("tablet", "mobile");
      });
    });
  });

  describe("dependency changes", () => {
    it("re-registers listener when dependencies change", async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender } = renderHook(
        ({ dep }: { dep: number }) => useBreakpointListener(callback1, [dep]),
        { initialProps: { dep: 1 } },
      );

      expect(callback1).toHaveBeenCalled();

      // Change dependency
      rerender({ dep: 2 });

      // Callback should still work
      mockUseWindowDimensions.mockReturnValue({ width: 768, height: 1024 });
      act(() => {
        jest.advanceTimersByTime(150);
      });
      rerender({ dep: 2 });

      await waitFor(() => {
        expect(callback1).toHaveBeenCalled();
      });
    });
  });
});

describe("breakpointNotifier singleton", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("notifies subscribers when breakpoint changes", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    // Subscribe two listeners
    const unsub1 = breakpointNotifier.subscribe(callback1);
    const unsub2 = breakpointNotifier.subscribe(callback2);

    // Initial notification
    expect(callback1).toHaveBeenCalledWith("mobile", "mobile");
    expect(callback2).toHaveBeenCalledWith("mobile", "mobile");

    // Change breakpoint
    breakpointNotifier.notify("tablet");

    expect(callback1).toHaveBeenCalledWith("tablet", "mobile");
    expect(callback2).toHaveBeenCalledWith("tablet", "mobile");

    // Cleanup
    unsub1();
    unsub2();
  });

  it("does not notify when breakpoint is same", () => {
    const callback = jest.fn();

    breakpointNotifier.subscribe(callback);
    breakpointNotifier.notify("mobile"); // Same as initial

    // Should only be called once (initial)
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes correctly", () => {
    const callback = jest.fn();

    const unsubscribe = breakpointNotifier.subscribe(callback);
    unsubscribe();

    breakpointNotifier.notify("tablet");

    expect(callback).not.toHaveBeenCalled();
  });

  it("returns current breakpoint", () => {
    expect(breakpointNotifier.getCurrentBreakpoint()).toBeDefined();
  });
});

describe("useBreakpointNotifier hook", () => {
  beforeEach(() => {
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls callback immediately", () => {
    const callback = jest.fn();

    renderHook(() => useBreakpointNotifier(callback));

    expect(callback).toHaveBeenCalledWith("mobile", "mobile");
  });

  it("unsubscribes on unmount", () => {
    const callback = jest.fn();

    const { unmount } = renderHook(() => useBreakpointNotifier(callback));
    unmount();

    breakpointNotifier.notify("tablet");

    expect(callback).not.toHaveBeenCalled();
  });
});
