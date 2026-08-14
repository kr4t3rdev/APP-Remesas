import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { WelcomeScreen } from "../WelcomeScreen.web";
import { LoginScreen } from "../LoginScreen.web";
import { RegisterScreen } from "../RegisterScreen.web";

describe("web authentication surface", () => {
  it("offers distinct entry actions from the web welcome surface", () => {
    const navigation = { navigate: jest.fn() };
    const { getByLabelText, getByText } = render(<WelcomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText("Iniciar sesión"));
    fireEvent.press(getByLabelText("Crear cuenta"));

    expect(navigation.navigate).toHaveBeenNthCalledWith(1, "Login");
    expect(navigation.navigate).toHaveBeenNthCalledWith(2, "Register");
    expect(getByText("Tu casa de cambio, en una sola estación.")).toBeTruthy();
    expect(getByText("Todo lo que mueve tu operación, conectado.")).toBeTruthy();
    expect(getByText("El control empieza cuando ves el día completo.")).toBeTruthy();
    expect(getByText("Empieza con una operación más clara.")).toBeTruthy();
  });

  it("exposes labelled login fields and validates empty submission", () => {
    const { getByTestId, getByRole, getByText } = render(<LoginScreen />);

    expect(getByTestId("web-login-email")).toBeTruthy();
    expect(getByTestId("web-login-password")).toBeTruthy();
    fireEvent.press(getByRole("button", { name: "Iniciar sesión" }));

    expect(getByText("Completa tu correo y contraseña para continuar.")).toBeTruthy();
  });

  it("keeps terms acceptance keyboard and pointer accessible on register", () => {
    jest.useFakeTimers();
    const { getByRole, unmount } = render(<RegisterScreen navigation={{ navigate: jest.fn() }} />);
    const checkbox = getByRole("checkbox");

    expect(checkbox.props.accessibilityState.checked).toBe(false);
    fireEvent.press(checkbox);
    expect(getByRole("checkbox").props.accessibilityState.checked).toBe(true);
    unmount();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});
