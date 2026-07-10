import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { RegisterScreen } from "../RegisterScreen";
import api from "../../../services/api";

jest.mock("../../../services/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock("../../../services/authValidationApi", () => ({
  checkEmailExists: jest.fn().mockResolvedValue(false),
  checkNicknameExists: jest.fn().mockResolvedValue(false),
}));

describe("RegisterScreen", () => {
  it("submits a valid registration and opens verification", async () => {
    const navigation = { goBack: jest.fn(), navigate: jest.fn(), replace: jest.fn() };
    const post = api.post as jest.Mock;
    post.mockResolvedValue({ data: {} });

    const { getAllByPlaceholderText, getByPlaceholderText, getByTestId, getByText } = render(
      <RegisterScreen navigation={navigation} />,
    );

    fireEvent.changeText(getByPlaceholderText("Juan Pérez"), "Juan Pérez");
    fireEvent.changeText(getByPlaceholderText("correo@ejemplo.com"), "juan@example.com");
    fireEvent.changeText(getAllByPlaceholderText("••••••••")[0], "Password1");
    fireEvent.changeText(getAllByPlaceholderText("••••••••")[1], "Password1");
    fireEvent.press(getByText("Acepto los términos y condiciones"));
    fireEvent.press(getByTestId("register-submit-button"));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/auth/register", {
        email: "juan@example.com",
        password: "Password1",
        name: "Juan Pérez",
        nickname: undefined,
      });
      expect(navigation.replace).toHaveBeenCalledWith("VerificationPending", {
        email: "juan@example.com",
      });
    });
  });
});
