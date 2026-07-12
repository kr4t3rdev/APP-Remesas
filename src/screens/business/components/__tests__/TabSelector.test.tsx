import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TabSelector } from "../TabSelector";

describe("TabSelector", () => {
  const tabs = [
    { key: "tab1", label: "Tab One", icon: "briefcase-outline" as const },
    { key: "tab2", label: "Tab Two", icon: "cash-outline" as const },
  ];

  it("renders correctly", () => {
    const { getByText } = render(
      <TabSelector tabs={tabs} activeTab="tab1" onTabChange={jest.fn()} />,
    );

    expect(getByText("Tab One")).toBeTruthy();
    expect(getByText("Tab Two")).toBeTruthy();
  });

  it("calls onTabChange when a tab is pressed", () => {
    const mockOnTabChange = jest.fn();
    const { getByText } = render(
      <TabSelector
        tabs={tabs}
        activeTab="tab1"
        onTabChange={mockOnTabChange}
      />,
    );

    fireEvent.press(getByText("Tab Two"));
    expect(mockOnTabChange).toHaveBeenCalledWith("tab2");
  });

  it("exposes the active tab through accessibility state", () => {
    const { getByRole } = render(
      <TabSelector tabs={tabs} activeTab="tab1" onTabChange={jest.fn()} />,
    );

    expect(getByRole("tab", { name: "Tab One" }).props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByRole("tab", { name: "Tab Two" }).props.accessibilityState).toEqual({
      selected: false,
    });
  });
});
