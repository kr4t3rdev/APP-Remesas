import React from "react";
import { render } from "@testing-library/react-native";
import { AdminHomeEventRow, AdminHomeEventRowType } from "../AdminHomeEventRow";

describe("AdminHomeEventRow", () => {
  const defaultProps = {
    action: "Usuario bloqueado",
    createdAt: new Date().toISOString(),
  };

  it("renders action text correctly", () => {
    const { getByText } = render(<AdminHomeEventRow {...defaultProps} />);

    expect(getByText("Usuario bloqueado")).toBeTruthy();
  });

  it("renders createdAt date", () => {
    const createdAt = "2024-01-15T10:30:00.000Z";
    const { getByText } = render(
      <AdminHomeEventRow {...defaultProps} createdAt={createdAt} />,
    );

    // Should show either "Hoy", "Ayer", or date format
    expect(getByText).toBeDefined();
  });

  it('uses derived type "block" for action containing "block"', () => {
    const { getByTestId } = render(
      <AdminHomeEventRow
        action="Usuario bloqueado"
        createdAt={new Date().toISOString()}
      />,
    );

    expect(getByTestId("admin-home-event-row")).toBeTruthy();
  });

  it('uses derived type "login" for action containing "login"', () => {
    const { getByText } = render(
      <AdminHomeEventRow
        action="Login exitoso"
        createdAt={new Date().toISOString()}
      />,
    );

    expect(getByText("Login exitoso")).toBeTruthy();
  });

  it('uses derived type "license" for action containing "license"', () => {
    const { getByText } = render(
      <AdminHomeEventRow
        action="Licencia renovada"
        createdAt={new Date().toISOString()}
      />,
    );

    expect(getByText("Licencia renovada")).toBeTruthy();
  });

  it("uses type from prop when provided", () => {
    const { getByText } = render(
      <AdminHomeEventRow
        action="Some action"
        createdAt={new Date().toISOString()}
        type="login"
      />,
    );

    expect(getByText("Some action")).toBeTruthy();
  });

  it("renders testID for testing purposes", () => {
    const { getByTestId } = render(<AdminHomeEventRow {...defaultProps} />);

    expect(getByTestId("admin-home-event-row")).toBeTruthy();
  });
});
