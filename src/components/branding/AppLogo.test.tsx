import React from "react";
import { render } from "@testing-library/react-native";
import { AppLogo } from "./AppLogo";

describe("AppLogo", () => {
  it("renders the Núcleo asset with accessible branding metadata", () => {
    const { getByTestId } = render(<AppLogo testID="app-logo" size={48} />);

    const logo = getByTestId("app-logo");

    expect(logo).toHaveStyle({ width: 48, height: 48 });
    expect(logo.props.accessibilityRole).toBe("image");
    expect(logo.props.accessibilityLabel).toBe("Logo de APP Finance");
  });
});
