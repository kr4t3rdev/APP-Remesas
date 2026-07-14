import React from "react";
import { render } from "@testing-library/react-native";
import { BarChart, HorizontalBarChart, StatsCard } from "./Charts";

const mockUseColors = jest.fn();

jest.mock("../../store/themeStore", () => ({
  useColors: () => mockUseColors(),
  useShadows: () => ({}),
}));

jest.mock("../animations", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => children,
}));

const data = [{ label: "Compras", value: 3 }];

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

      const { getByText } = render(
        <BarChart data={data} animated={false} />,
      );

      expect(getByText("3")).toHaveStyle({ color: primaryText });
      expect(getByText("Compras")).toHaveStyle({ color: secondaryText });
    },
  );
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
});

describe("StatsCard compact layout", () => {
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
