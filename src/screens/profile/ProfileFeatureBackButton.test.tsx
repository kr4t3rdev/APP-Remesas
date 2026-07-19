import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { useNavigation } from "@react-navigation/native";
import { ProfileFeatureBackButton } from "./ProfileFeatureBackButton";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

describe("ProfileFeatureBackButton", () => {
  it("returns to the previous screen when pressed", () => {
    const goBack = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ goBack });

    const { getByLabelText } = render(<ProfileFeatureBackButton />);

    fireEvent.press(getByLabelText("Regresar al perfil"));

    expect(goBack).toHaveBeenCalledTimes(1);
  });
});
