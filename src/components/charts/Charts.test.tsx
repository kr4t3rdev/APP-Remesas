import React from "react";
import { render } from "@testing-library/react-native";
import { Animated } from "react-native";
import {
  BarChart,
  CircularProgress,
  HorizontalBarChart,
  StatsCard,
} from "./Charts";

const mockUseColors = jest.fn();
const mockUseReducedMotion = jest.fn<boolean | null, []>(() => false);

jest.mock("../../store/themeStore", () => ({
  useColors: () => mockUseColors(),
  useShadows: () => ({}),
}));

jest.mock("../animations", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => children,
  useReducedMotion: () => mockUseReducedMotion(),
}));

jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: ({ children, ...props }: { children: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
    Circle: (props: Record<string, unknown>) => <View {...props} />,
  };
});

const data = [{ label: "Compras", value: 3 }];

const getAnimatedNumber = (value: number | { __getValue: () => number }) =>
  typeof value === "number" ? value : value.__getValue();

beforeEach(() => mockUseReducedMotion.mockReturnValue(false));

describe("BarChart theme colors", () => {
  it.each([
    ["light", "#102A30", "#526C72", "#0E7490"],
    ["dark", "#EDF8F9", "#A3C0C5", "#22D3EE"],
  ])(
    "uses %s theme colors for values and labels",
    (_theme, primaryText, secondaryText, primaryBar) => {
      mockUseColors.mockReturnValue({
        primary: { 500: primaryBar },
        text: { primary: primaryText, secondary: secondaryText },
      });

      const { getByText } = render(<BarChart data={data} animated={false} />);

      expect(getByText("3")).toHaveStyle({ color: primaryText });
      expect(getByText("Compras")).toHaveStyle({ color: secondaryText });
    },
  );

  it("renders a clear empty state without invalid scale values", () => {
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      text: { primary: "#102A30", secondary: "#526C72" },
    });

    const { getByText, queryByTestId } = render(<BarChart data={[]} />);

    expect(getByText("Sin datos para mostrar")).toBeTruthy();
    expect(queryByTestId("bar-chart-bar-0")).toBeNull();
  });

  it("uses a safe scale and represents zero without a misleading bar", () => {
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      text: { primary: "#102A30", secondary: "#526C72" },
    });

    const { getByLabelText, getByTestId } = render(
      <BarChart
        data={[
          { label: "Compras", value: 0 },
          { label: "Ventas", value: 10 },
        ]}
        maxValue={0}
        height={100}
        animated={false}
      />,
    );

    expect(getByTestId("bar-chart-bar-0")).toHaveStyle({ height: 0 });
    expect(getByTestId("bar-chart-bar-1")).toHaveStyle({ height: 100 });
    expect(getByLabelText("Compras: 0")).toBeTruthy();
    expect(getByLabelText("Ventas: 10")).toBeTruthy();
  });

  it("keeps a negative display value while clamping only its visual height", () => {
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      text: { primary: "#102A30", secondary: "#526C72" },
    });

    const { getByLabelText, getByTestId, getByText } = render(
      <BarChart
        data={[{ label: "Ajustes", value: -5 }]}
        height={100}
        animated={false}
      />,
    );

    expect(getByText("-5")).toBeTruthy();
    expect(getByLabelText("Ajustes: -5")).toBeTruthy();
    expect(getByTestId("bar-chart-bar-0")).toHaveStyle({ height: 0 });
  });

  it("animates bar height with timing when enabled", () => {
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      text: { primary: "#102A30", secondary: "#526C72" },
    });
    const timingSpy = jest
      .spyOn(Animated, "timing")
      .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });

    render(<BarChart data={data} height={90} animated />);

    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 90 }),
    );
    timingSpy.mockRestore();
  });

  it("renders the final bar immediately when reduced motion is enabled", () => {
    mockUseReducedMotion.mockReturnValue(true);
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      text: { primary: "#102A30", secondary: "#526C72" },
    });
    const timingSpy = jest.spyOn(Animated, "timing");

    const { getByTestId } = render(<BarChart data={data} height={90} animated />);

    expect(getByTestId("bar-chart-bar-0")).toHaveStyle({ height: 90 });
    expect(timingSpy).not.toHaveBeenCalled();
  });
});

describe("CircularProgress", () => {
  it.each([
    ["light", "#D8E7E9", "#0E7490"],
    ["dark", "#24474E", "#22D3EE"],
  ])(
    "draws a theme-aware track and progress arc in %s mode",
    (_theme, border, primary) => {
      mockUseColors.mockReturnValue({
        primary: { 500: primary },
        border,
        text: { primary: "#102A30" },
      });

      const { getByTestId } = render(
        <CircularProgress percentage={25} animated={false} />,
      );

      expect(getByTestId("circular-progress-track")).toHaveProp(
        "stroke",
        border,
      );
      expect(getByTestId("circular-progress-arc")).toHaveProp(
        "stroke",
        primary,
      );
      expect(
        getAnimatedNumber(
          getByTestId("circular-progress-arc").props.strokeDashoffset,
        ),
      ).toBeGreaterThan(0);
    },
  );

  it("clamps progress to 0..100 and exposes the complete state", () => {
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      border: "#D8E7E9",
      text: { primary: "#102A30" },
    });

    const { getByLabelText, getByTestId, getByText } = render(
      <CircularProgress percentage={140} animated={false} />,
    );

    expect(
      getByLabelText("Progreso: 100%, completado"),
    ).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 100,
      text: "Completado",
    });
    expect(getByText("100%")).toBeTruthy();
    expect(
      getAnimatedNumber(
        getByTestId("circular-progress-arc").props.strokeDashoffset,
      ),
    ).toBe(0);
  });

  it("never rounds an incomplete 99.6 value to 100 or completed", () => {
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      border: "#D8E7E9",
      text: { primary: "#102A30" },
    });

    const { getByLabelText, getByText, queryByText } = render(
      <CircularProgress percentage={99.6} animated={false} />,
    );

    expect(getByText("99.6%")).toBeTruthy();
    expect(queryByText("100%")).toBeNull();
    expect(getByLabelText("Progreso: 99.6%")).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 99.6,
      text: "99.6%",
    });
  });

  it("animates the arc with timing when enabled", () => {
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      border: "#D8E7E9",
      text: { primary: "#102A30" },
    });
    const timingSpy = jest
      .spyOn(Animated, "timing")
      .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });

    render(<CircularProgress percentage={50} animated />);

    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        toValue: expect.any(Number),
        useNativeDriver: false,
      }),
    );
    timingSpy.mockRestore();
  });
});

describe("HorizontalBarChart theme colors", () => {
  it.each([
    ["light", "#102A30", "#526C72", "#D8E7E9", "#0E7490"],
    ["dark", "#EDF8F9", "#A3C0C5", "#24474E", "#22D3EE"],
  ])(
    "uses %s theme colors for labels, values, track, and fallback bar",
    (_theme, primaryText, secondaryText, border, primaryBar) => {
      mockUseColors.mockReturnValue({
        primary: { 500: primaryBar },
        border,
        text: { primary: primaryText, secondary: secondaryText },
      });

      const { getByText, getByTestId } = render(
        <HorizontalBarChart data={data} animated={false} />,
      );

      expect(getByText("Compras")).toHaveStyle({ color: primaryText });
      expect(getByText("100.0%")).toHaveStyle({ color: secondaryText });
      expect(getByTestId("horizontal-bar-track-0")).toHaveStyle({
        backgroundColor: border,
      });
      expect(getByTestId("horizontal-bar-fill-0")).toHaveStyle({
        backgroundColor: primaryBar,
      });
    },
  );

  it("uses a safe scale and clamps only visual percentages", () => {
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      border: "#D8E7E9",
      text: { primary: "#102A30", secondary: "#526C72" },
    });

    const { getByLabelText } = render(
      <HorizontalBarChart
        data={[
          { label: "Negativo", value: -5 },
          { label: "Cero", value: 0 },
          { label: "Exceso", value: 20 },
        ]}
        maxValue={10}
        animated={false}
      />,
    );

    expect(getByLabelText("Negativo: -50.0%")).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 0,
      text: "-50.0%",
    });
    expect(getByLabelText("Cero: 0.0%")).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 0,
      text: "0.0%",
    });
    expect(getByLabelText("Exceso: 200.0%")).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 100,
      text: "200.0%",
    });
  });

  it("handles empty and all-zero data without an invalid scale", () => {
    mockUseColors.mockReturnValue({
      primary: { 500: "#0E7490" },
      border: "#D8E7E9",
      text: { primary: "#102A30", secondary: "#526C72" },
    });

    const empty = render(<HorizontalBarChart data={[]} animated={false} />);
    expect(empty.queryByTestId("horizontal-bar-fill-0")).toBeNull();

    const zero = render(
      <HorizontalBarChart
        data={[{ label: "Cero", value: 0 }]}
        maxValue={0}
        animated={false}
      />,
    );
    expect(zero.getByLabelText("Cero: 0.0%")).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 0,
      text: "0.0%",
    });
  });
});

describe("StatsCard compact layout", () => {
  it("does not flicker when reduced motion resolves from null to false", () => {
    mockUseColors.mockReturnValue({
      card: "#FCFEFE",
      text: { primary: "#102A30", secondary: "#526C72", tertiary: "#526C72" },
      success: "#166534",
      danger: "#B91C1C",
    });
    mockUseReducedMotion.mockReturnValue(null);
    const timingSpy = jest.spyOn(Animated, "timing");

    const { getByTestId, rerender } = render(
      <StatsCard testID="stats-card" title="Ganancia" value="$ 100.00" />,
    );

    mockUseReducedMotion.mockReturnValue(false);
    rerender(
      <StatsCard testID="stats-card" title="Ganancia" value="$ 100.00" />,
    );

    const cardStyle = getByTestId("stats-card").props.style;
    expect(getAnimatedNumber(cardStyle.transform[0].scale)).toBe(1);
    expect(getAnimatedNumber(cardStyle.opacity)).toBe(1);
    expect(timingSpy).not.toHaveBeenCalled();
    timingSpy.mockRestore();
  });

  it("allows callers to remove the default minimum width", () => {
    mockUseColors.mockReturnValue({
      card: "#FCFEFE",
      text: { primary: "#102A30", secondary: "#526C72", tertiary: "#526C72" },
      success: "#166534",
      danger: "#B91C1C",
    });

    const { getByTestId } = render(
      <StatsCard
        testID="compact-stats-card"
        title="Ganancia"
        value="$ 100.00"
        color="#0E7490"
        animated={false}
        style={{ minWidth: 0 }}
      />,
    );

    expect(getByTestId("compact-stats-card")).toHaveStyle({ minWidth: 0 });
  });
});
