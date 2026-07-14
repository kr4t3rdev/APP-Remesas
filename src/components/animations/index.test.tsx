import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { AccessibilityInfo, Animated, Text } from "react-native";
import { FadeInDown, PressableScale, ScaleIn, useReducedMotion } from ".";

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
});
