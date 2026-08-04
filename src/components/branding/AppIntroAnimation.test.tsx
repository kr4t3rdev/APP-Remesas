import React from "react";
import { AccessibilityInfo, Animated } from "react-native";
import { act, render, waitFor } from "@testing-library/react-native";
import {
  APP_INTRO_MOTION_PROFILE,
  AppIntroAnimation,
} from "./AppIntroAnimation";

describe("AppIntroAnimation", () => {
  let timingSpy: jest.SpyInstance;
  let sequenceSpy: jest.SpyInstance;

  beforeEach(() => {
    timingSpy = jest.spyOn(Animated, "timing").mockImplementation(
      () =>
        ({
          start: (callback?: (result: { finished: boolean }) => void) =>
            callback?.({ finished: true }),
          stop: jest.fn(),
          reset: jest.fn(),
        }) as Animated.CompositeAnimation,
    );
    sequenceSpy = jest.spyOn(Animated, "sequence").mockImplementation(
      () =>
        ({
          start: (callback?: (result: { finished: boolean }) => void) =>
            callback?.({ finished: true }),
          stop: jest.fn(),
          reset: jest.fn(),
        }) as Animated.CompositeAnimation,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("retains the selected Orbit motion identity", () => {
    expect(APP_INTRO_MOTION_PROFILE).toEqual({
      duration: 1180,
      fadeOutDuration: 180,
      orbitDegrees: 720,
      logoRotationDegrees: 32,
      logoScale: [0.68, 1],
    });
  });

  it("automatically completes and exposes no manual controls", async () => {
    const onComplete = jest.fn();
    const { queryByRole } = render(
      <AppIntroAnimation onComplete={onComplete} reducedMotionOverride={false} />,
    );

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(sequenceSpy).toHaveBeenCalledTimes(1);
    expect(queryByRole("button")).toBeNull();
  });

  it("uses only short animations for reduced motion before dismissing", async () => {
    const onComplete = jest.fn();
    render(
      <AppIntroAnimation onComplete={onComplete} reducedMotionOverride />,
    );

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(timingSpy).toHaveBeenCalled();
    expect(
      timingSpy.mock.calls.every(([, config]) => config.duration <= 150),
    ).toBe(true);
  });

  it("falls back to standard motion when the accessibility lookup stalls", async () => {
    jest.useFakeTimers();
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockImplementation(() => new Promise<boolean>(() => undefined));
    const onComplete = jest.fn();

    render(<AppIntroAnimation onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
