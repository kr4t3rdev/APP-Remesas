import React from "react";
import { AccessibilityInfo, Animated } from "react-native";
import { act, render, fireEvent, waitFor } from "@testing-library/react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

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
  TabBarMotionProvider,
  useTabScrollToTop,
} from "./TabBarMotionProvider";

const routeNames = [
  "Home",
  "Transactions",
  "Cash",
  "ExpenseItems",
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

  it("renders all primary tabs and marks the active route", () => {
    const { getByTestId, getByText } = renderTabBar(createProps(2));

    expect(getByText("Inicio")).toBeTruthy();
    expect(getByText("Transacciones")).toBeTruthy();
    expect(getByText("Caja")).toBeTruthy();
    expect(getByText("Gastos")).toBeTruthy();
    expect(getByText("Perfil")).toBeTruthy();
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
    });
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
