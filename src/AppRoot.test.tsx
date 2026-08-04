import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
jest.mock("../src/navigation/AppNavigator", () => ({
  AppNavigator: () => {
    const { View } = require("react-native");
    return <View testID="app-navigator" />;
  },
}));

jest.mock("../src/components/ui", () => ({
  ToastContainer: () => null,
}));

jest.mock("../src/components/ui/WebToaster", () => ({
  WebToaster: () => null,
}));

jest.mock("../src/components/branding/AppIntroAnimation", () => ({
  AppIntroAnimation: ({ onComplete }: { onComplete: () => void }) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable testID="app-intro-overlay" onPress={onComplete}>
        <Text>Intro</Text>
      </Pressable>
    );
  },
}));

import { AppRoot } from "../App";

describe("AppRoot startup composition", () => {
  it("mounts AppNavigator immediately behind the blocking intro overlay", () => {
    const { getByTestId, queryByTestId, unmount } = render(<AppRoot />);

    expect(getByTestId("app-navigator")).toBeTruthy();
    expect(getByTestId("app-intro-overlay")).toBeTruthy();

    fireEvent.press(getByTestId("app-intro-overlay"));

    expect(queryByTestId("app-intro-overlay")).toBeNull();
    expect(getByTestId("app-navigator")).toBeTruthy();

    unmount();
    const nextRoot = render(<AppRoot />);
    expect(nextRoot.queryByTestId("app-intro-overlay")).toBeNull();
    expect(nextRoot.getByTestId("app-navigator")).toBeTruthy();
  });
});
