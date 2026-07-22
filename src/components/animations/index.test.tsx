import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { AccessibilityInfo, Animated, StyleSheet, Text } from "react-native";
import { FadeInDown, FadeInOverlay, PressableScale, ScaleIn, useReducedMotion } from ".";

const flushPromises = () => act(async () => Promise.resolve());

const ReducedMotionProbe = () => {
  const reducedMotion = useReducedMotion();
  return <Text>{String(reducedMotion)}</Text>;
};

describe("reduced motion animations", () => {
  afterEach(() => jest.restoreAllMocks());

  it("subscribes safely and removes the reduced-motion listener", async () => {
    const remove = jest.fn();
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(false);
    const addListener = jest
      .spyOn(AccessibilityInfo, "addEventListener")
      .mockReturnValue({ remove } as never);

    const { getByText, unmount } = render(<ReducedMotionProbe />);
    await flushPromises();

    expect(getByText("false")).toBeTruthy();
    expect(addListener).toHaveBeenCalledWith("reduceMotionChanged", expect.any(Function));
    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("falls back safely when the reduced-motion API is unavailable", async () => {
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockImplementation(
      undefined as never,
    );
    const remove = jest.fn();
    jest
      .spyOn(AccessibilityInfo, "addEventListener")
      .mockReturnValue({ remove } as never);

    const { getByText, unmount } = render(<ReducedMotionProbe />);
    await flushPromises();

    expect(getByText("false")).toBeTruthy();
    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("keeps translated and scaled entrances immediately visible when motion is reduced", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(true);
    const timing = jest.spyOn(Animated, "timing");

    const translated = render(<FadeInDown><Text>Translated</Text></FadeInDown>);
    const scaled = render(<ScaleIn><Text>Scaled</Text></ScaleIn>);
    await flushPromises();

    expect(translated.getByText("Translated")).toBeTruthy();
    expect(scaled.getByText("Scaled")).toBeTruthy();
    expect(timing).not.toHaveBeenCalled();
  });

  it("does not scale press feedback when motion is reduced", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(true);
    const timing = jest.spyOn(Animated, "timing");
    const onPress = jest.fn();
    const { getByText } = render(
      <PressableScale onPress={onPress}><Text>Pay</Text></PressableScale>,
    );
    await flushPromises();

    fireEvent(getByText("Pay"), "pressIn");
    fireEvent.press(getByText("Pay"));

    expect(timing).not.toHaveBeenCalled();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders a non-interactive full-screen overlay at the requested opacity", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(true);
    const { UNSAFE_getByType } = render(<FadeInOverlay targetOpacity={0.25} />);
    await flushPromises();

    const overlay = UNSAFE_getByType(Animated.View);
    expect(overlay.props.pointerEvents).toBe("none");
    expect(StyleSheet.flatten(overlay.props.style)).toMatchObject({
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "#000",
    });
    expect(overlay.props.style[1].opacity.__getValue()).toBe(0.25);
  });
});
