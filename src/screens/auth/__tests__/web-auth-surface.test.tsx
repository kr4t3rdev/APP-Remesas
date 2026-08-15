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
    const { getByTestId, getByRole, getByText } = render(
      <LoginScreen navigation={{ navigate: jest.fn() }} />,
    );

    expect(getByTestId("web-login-email")).toBeTruthy();
    expect(getByTestId("web-login-password")).toBeTruthy();
    expect(getByText("Cashflow")).toBeTruthy();
    expect(getByText("Vuelve a tu mesa operativa.")).toBeTruthy();
    fireEvent.press(getByRole("button", { name: "Iniciar sesión" }));

    expect(getByText("Completa tu correo y contraseña para continuar.")).toBeTruthy();
  });

  it("goes back to the landing page from login", () => {
    const navigation = { navigate: jest.fn() };
    const { getByRole } = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(getByRole("button", { name: "Volver al inicio" }));

    expect(navigation.navigate).toHaveBeenCalledWith("Welcome");
  });

  it("goes back to the landing page from register", () => {
    const navigation = { navigate: jest.fn() };
    const { getByRole } = render(<RegisterScreen navigation={navigation} />);

    fireEvent.press(getByRole("button", { name: "Volver al inicio" }));

    expect(navigation.navigate).toHaveBeenCalledWith("Welcome");
  });

  it("keeps terms acceptance keyboard and pointer accessible on register", () => {
    jest.useFakeTimers();
    const { getByRole, getByText, unmount } = render(
      <RegisterScreen navigation={{ navigate: jest.fn() }} />,
    );
    const checkbox = getByRole("checkbox");

    expect(checkbox.props.accessibilityState.checked).toBe(false);
    expect(getByText("Cashflow")).toBeTruthy();
    expect(getByText("Crea tu estación de trabajo.")).toBeTruthy();
    fireEvent.press(checkbox);
    expect(getByRole("checkbox").props.accessibilityState.checked).toBe(true);
    unmount();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});
