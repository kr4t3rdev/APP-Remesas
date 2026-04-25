import { renderHook, act } from "@testing-library/react-native";
import { useRegisterAnimations } from "../useRegisterAnimations";
import { Animated } from "react-native";

describe("useRegisterAnimations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize animations correctly", () => {
    const { result } = renderHook(() => useRegisterAnimations(false));

    expect(result.current.fadeAnim).toBeInstanceOf(Animated.Value);
    expect(result.current.slideAnim).toBeInstanceOf(Animated.Value);
    expect(result.current.btnScale).toBeInstanceOf(Animated.Value);
  });

  it("should start with btnHovered as false", () => {
    const { result } = renderHook(() => useRegisterAnimations(false));

    expect(result.current.btnHovered).toBe(false);
  });

  it("should trigger animations on mount", () => {
    const timeoutSpy = jest.spyOn(global, "setTimeout");
    renderHook(() => useRegisterAnimations(false));

    expect(timeoutSpy).toHaveBeenCalled();
    timeoutSpy.mockRestore();
  });

  it("should handle desktop button interactions", () => {
    const { result } = renderHook(() => useRegisterAnimations(true));

    act(() => {
      result.current.onMouseEnter();
    });
    expect(result.current.btnHovered).toBe(true);

    act(() => {
      result.current.onMouseLeave();
    });
    expect(result.current.btnHovered).toBe(false);
  });

  it("should handle mobile button interactions", () => {
    const { result } = renderHook(() => useRegisterAnimations(false));

    act(() => {
      result.current.onPressIn();
    });
    // Mobile doesn't change btnHovered
    expect(result.current.btnHovered).toBe(false);

    act(() => {
      result.current.onPressOut();
    });
    expect(result.current.btnHovered).toBe(false);
  });

  it("should not change btnHovered on desktop mouse events when isDesktop is false", () => {
    const { result } = renderHook(() => useRegisterAnimations(false));

    act(() => {
      result.current.onMouseEnter();
    });
    expect(result.current.btnHovered).toBe(false);

    act(() => {
      result.current.onMouseLeave();
    });
    expect(result.current.btnHovered).toBe(false);
  });

  it("should allow manual setBtnHovered", () => {
    const { result } = renderHook(() => useRegisterAnimations(false));

    act(() => {
      result.current.setBtnHovered(true);
    });
    expect(result.current.btnHovered).toBe(true);

    act(() => {
      result.current.setBtnHovered(false);
    });
    expect(result.current.btnHovered).toBe(false);
  });
});
