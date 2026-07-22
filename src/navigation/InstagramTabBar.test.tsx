import React from "react";
import { AccessibilityInfo, Animated, Keyboard, View } from "react-native";
import { act, render, fireEvent, waitFor } from "@testing-library/react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

jest.mock("expo-blur", () => {
  const React = require("react");
  const { View } = require("react-native");
  return { BlurView: (props: object) => <View {...props} /> };
});

jest.mock("../store/themeStore", () => ({
  useIsDark: () => false,
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

import { InstagramTabBar } from "./InstagramTabBar";
import {
  ACTIVE_INDICATOR_GEOMETRY,
  TAB_BAR_BLUR,
  TAB_BAR_EMPHASIS_MOTION,
} from "./InstagramTabBar";
import {
  TabBarMotionProvider,
  useTabScrollToTop,
} from "./TabBarMotionProvider";

const routeNames = [
  "Home",
  "Transactions",
  "Cash",
  "Expenses",
  "Profile",
] as const;

const createProps = (activeIndex = 0): BottomTabBarProps => {
  const routes = routeNames.map((name) => ({ key: `${name}-key`, name }));
  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const navigate = jest.fn();

  return {
    state: {
      stale: false,
      type: "tab",
      key: "main-tabs",
      index: activeIndex,
      routeNames: [...routeNames],
      routes,
      history: [],
      preloadedRouteKeys: [],
    },
    descriptors: Object.fromEntries(
      routes.map((route) => [
        route.key,
        {
          options: {},
          route,
          navigation: {} as never,
          render: () => null,
        },
      ]),
    ) as unknown as BottomTabBarProps["descriptors"],
    navigation: {
      emit,
      navigate,
    } as never,
    insets: { top: 0, right: 0, bottom: 34, left: 0 },
  };
};

const ScrollToTopRegistration = ({ callback }: { callback: () => void }) => {
  useTabScrollToTop("Home", callback);
  return null;
};

const renderTabBar = (props: BottomTabBarProps, scrollToTop?: () => void) =>
  render(
    <TabBarMotionProvider>
      {scrollToTop && <ScrollToTopRegistration callback={scrollToTop} />}
      <InstagramTabBar {...props} />
    </TabBarMotionProvider>,
  );

describe("InstagramTabBar", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders all primary tabs without labels", () => {
    const { getByTestId } = renderTabBar(createProps(2));

    routeNames.forEach((name) => {
      expect(getByTestId(`tab-${name}`)).toBeTruthy();
    });
    expect(getByTestId("tab-Cash").props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByTestId("tab-Cash").props.accessibilityHint).toBe(
      "Pestaña seleccionada. Toca de nuevo para volver al inicio.",
    );
    expect(getByTestId("tab-Profile").props.accessibilityHint).toBe(
      "Abre la pestaña Perfil.",
    );
  });

  it("places a clipped system blur layer behind crisp tab content", () => {
    const view = renderTabBar(createProps());
    const bar = view.getByTestId("floating-tab-bar");
    const material = view.getByTestId("tab-bar-material");
    const blur = view.getByTestId("tab-bar-blur");
    const items = view.getByTestId("tab-bar-items");

    expect(material.props.style).toMatchObject({
      borderRadius: 28,
      overflow: "hidden",
    });
    expect(blur.props).toMatchObject({
      intensity: TAB_BAR_BLUR.intensity,
      tint: "systemThinMaterialLight",
      experimentalBlurMethod: "dimezisBlurView",
      pointerEvents: "none",
    });
    expect(bar.children.indexOf(material)).toBeLessThan(bar.children.indexOf(items));
  });

  it("provides forgiving touch targets for every tab", () => {
    const { getByTestId } = renderTabBar(createProps());

    routeNames.forEach((routeName) => {
      expect(getByTestId(`tab-${routeName}`).props.hitSlop).toEqual({
        top: 4,
        right: 2,
        bottom: 4,
        left: 2,
      });
    });
  });

  it("enlarges the bar and icons on scroll-down without labels", () => {
    expect(TAB_BAR_EMPHASIS_MOTION.barScaleX).toBe(1.07);
    expect(TAB_BAR_EMPHASIS_MOTION.barScaleY).toBe(1.09);
    expect(TAB_BAR_EMPHASIS_MOTION.iconScale).toBe(1.08);
    expect(TAB_BAR_EMPHASIS_MOTION.labelScale).toBe(1.06);
    expect(TAB_BAR_EMPHASIS_MOTION.labelOpacity).toBe(1);
  });

  it("uses compact indicator geometry for labeled tabs and large geometry for Cash", () => {
    expect(ACTIVE_INDICATOR_GEOMETRY).toEqual({
      compact: { width: 48, height: 46 },
      large: { width: 56, height: 48 },
      top: 2,
    });
  });

  it("animates the indicator to large geometry when Cash becomes active", () => {
    const timing = jest.spyOn(Animated, "timing");
    const view = renderTabBar(createProps(0));

    view.rerender(
      <TabBarMotionProvider>
        <InstagramTabBar {...createProps(2)} />
      </TabBarMotionProvider>,
    );

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 1, useNativeDriver: true }),
    );
  });

  it("animates the indicator back to compact geometry for a labeled tab", () => {
    const timing = jest.spyOn(Animated, "timing");
    const view = renderTabBar(createProps(2));
    timing.mockClear();

    view.rerender(
      <TabBarMotionProvider>
        <InstagramTabBar {...createProps(4)} />
      </TabBarMotionProvider>,
    );

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 0, useNativeDriver: true }),
    );
  });

  it("isolates indicator translation from geometry scaling", async () => {
    const view = renderTabBar(createProps(0));
    await act(async () => undefined);
    const itemsRow = view
      .UNSAFE_getAllByType(View)
      .find((node) => node.props.style?.flexDirection === "row");

    expect(itemsRow).toBeTruthy();
    act(() => {
      fireEvent(itemsRow!, "layout", {
        nativeEvent: { layout: { width: 350, height: 56, x: 0, y: 0 } },
      });
    });

    const translationTransform = view.getByTestId("active-tab-indicator").props
      .style.transform;
    const geometryTransform = view.getByTestId("active-tab-indicator-shape")
      .props.style.transform;

    expect(
      translationTransform.map((entry: object) => Object.keys(entry)[0]),
    ).toEqual(["translateX"]);
    expect(
      geometryTransform.map((entry: object) => Object.keys(entry)[0]),
    ).toEqual(["scaleX", "scaleY"]);
  });

  it("hides while the keyboard is visible and returns when it closes", () => {
    const listeners: Record<string, () => void> = {};
    const remove = jest.fn();
    jest.spyOn(Keyboard, "addListener").mockImplementation(((event: string, listener: () => void) => {
      listeners[event] = listener;
      return { remove };
    }) as never);

    const view = renderTabBar(createProps());
    act(() => listeners.keyboardDidShow());
    expect(view.queryByTestId("floating-tab-bar")).toBeNull();

    act(() => listeners.keyboardDidHide());
    expect(view.getByTestId("floating-tab-bar")).toBeTruthy();

    view.unmount();
    expect(remove).toHaveBeenCalledTimes(2);
  });

  it("handles failed accessibility reads without an unhandled rejection", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockRejectedValue(new Error("Unavailable"));
    jest
      .spyOn(AccessibilityInfo, "isReduceTransparencyEnabled")
      .mockRejectedValue(new Error("Unavailable"));

    expect(() => renderTabBar(createProps())).not.toThrow();
    await act(async () => undefined);
  });

  it("emits tabPress and navigates when an inactive tab is pressed", () => {
    const props = createProps(0);
    const { getByTestId } = renderTabBar(props);

    fireEvent.press(getByTestId("tab-Profile"));

    expect(props.navigation.emit).toHaveBeenCalledWith({
      type: "tabPress",
      target: "Profile-key",
      canPreventDefault: true,
    });
    expect(props.navigation.navigate).toHaveBeenCalledWith("Profile", undefined);
  });

  it("uses jumpTo for inactive tabs when bottom-tab navigation provides it", () => {
    const props = createProps(0);
    const jumpTo = jest.fn();
    (props.navigation as unknown as { jumpTo: jest.Mock }).jumpTo = jumpTo;
    const { getByTestId } = renderTabBar(props);

    fireEvent.press(getByTestId("tab-Profile"));

    expect(jumpTo).toHaveBeenCalledWith("Profile");
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  it("does not navigate when tabPress is prevented", () => {
    const props = createProps(0);
    (props.navigation.emit as jest.Mock).mockReturnValue({
      defaultPrevented: true,
    });
    const { getByTestId } = renderTabBar(props);

    fireEvent.press(getByTestId("tab-Profile"));

    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  it("emits tabPress without navigating when the active tab is pressed", () => {
    const props = createProps(0);
    const { getByTestId } = renderTabBar(props);

    fireEvent.press(getByTestId("tab-Home"));

    expect(props.navigation.emit).toHaveBeenCalledWith({
      type: "tabPress",
      target: "Home-key",
      canPreventDefault: true,
    });
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  it("scrolls the active tab to top after an unprevented tabPress", () => {
    const props = createProps(0);
    const scrollToTop = jest.fn();
    const { getByTestId } = renderTabBar(props, scrollToTop);

    fireEvent.press(getByTestId("tab-Home"));

    expect(scrollToTop).toHaveBeenCalledTimes(1);
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  it("does not scroll the active tab when tabPress is prevented", () => {
    const props = createProps(0);
    const scrollToTop = jest.fn();
    (props.navigation.emit as jest.Mock).mockReturnValue({
      defaultPrevented: true,
    });
    const { getByTestId } = renderTabBar(props, scrollToTop);

    fireEvent.press(getByTestId("tab-Home"));

    expect(scrollToTop).not.toHaveBeenCalled();
  });

  it("expands the bar when the active route changes", () => {
    const timing = jest.spyOn(Animated, "timing");
    const view = renderTabBar(createProps(0));

    view.rerender(
      <TabBarMotionProvider>
        <InstagramTabBar {...createProps(1)} />
      </TabBarMotionProvider>,
    );

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 0, useNativeDriver: true }),
    );
  });

  it("scales a tab down on press-in and restores it on press-out", () => {
    const start = jest.fn();
    const spring = jest
      .spyOn(Animated, "spring")
      .mockReturnValue({ start } as never);
    const { getByTestId } = renderTabBar(createProps(0));

    fireEvent(getByTestId("tab-Profile"), "pressIn");
    fireEvent(getByTestId("tab-Profile"), "pressOut");

    expect(spring).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 0.94, useNativeDriver: true }),
    );
    expect(spring).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 1, useNativeDriver: true }),
    );
    expect(start).toHaveBeenCalledTimes(2);
  });

  it("uses an opaque surface when Reduce Transparency is enabled", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceTransparencyEnabled")
      .mockResolvedValue(true);
    const { getByTestId } = renderTabBar(createProps(0));

    await waitFor(() => {
      expect(getByTestId("floating-tab-bar").props.style).toMatchObject({
        backgroundColor: "#FFFFFF",
      });
      expect(getByTestId("tab-bar-material").props.style).toMatchObject({
        backgroundColor: "#FFFFFF",
      });
      expect(() => getByTestId("tab-bar-blur")).toThrow();
    });
  });

  it("renders when Reduce Transparency is unavailable on web", () => {
    const reduceTransparency = AccessibilityInfo.isReduceTransparencyEnabled;
    try {
      delete (AccessibilityInfo as { isReduceTransparencyEnabled?: unknown }).isReduceTransparencyEnabled;
      expect(() => renderTabBar(createProps(0))).not.toThrow();
    } finally {
      (AccessibilityInfo as { isReduceTransparencyEnabled?: unknown }).isReduceTransparencyEnabled = reduceTransparency;
    }
  });

  it("responds to Reduce Transparency changes and removes the listener", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceTransparencyEnabled")
      .mockResolvedValue(false);
    let onChange: ((enabled: boolean) => void) | undefined;
    const remove = jest.fn();
    jest
      .spyOn(AccessibilityInfo, "addEventListener")
      .mockImplementation(((...args: any[]) => {
        const [eventName, listener] = args;
        if (eventName === "reduceTransparencyChanged") {
          onChange = listener as (enabled: boolean) => void;
          return { remove };
        }
        return { remove: jest.fn() };
      }) as never);

    const view = renderTabBar(createProps(0));
    await act(async () => undefined);
    act(() => onChange?.(true));

    expect(view.getByTestId("floating-tab-bar").props.style).toMatchObject({
      backgroundColor: "#FFFFFF",
    });

    view.unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
