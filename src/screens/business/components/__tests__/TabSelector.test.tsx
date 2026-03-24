import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TabSelector } from "../TabSelector";

describe("TabSelector", () => {
  const tabs = [
    { key: "tab1", label: "Tab One" },
    { key: "tab2", label: "Tab Two" },
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
});
