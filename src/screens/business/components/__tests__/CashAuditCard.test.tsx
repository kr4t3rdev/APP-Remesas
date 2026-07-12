import React from "react";
import { render } from "@testing-library/react-native";
import { CashAuditCard } from "../CashAuditCard";

describe("CashAuditCard", () => {
  it("renders audit labels in Spanish", () => {
    const { getByText } = render(
      <CashAuditCard
        audit={{
          dateFormatted: "12 jul, 2026 · 10:45",
          expected: 15000,
          actual: 15000,
          status: "MATCHED",
          auditorName: "Usuario actual",
        }}
      />,
    );

    expect(getByText("ÚLTIMO ARQUEO")).toBeTruthy();
    expect(getByText("Fecha del arqueo")).toBeTruthy();
    expect(getByText("Esperado")).toBeTruthy();
    expect(getByText("Real")).toBeTruthy();
    expect(getByText("Diferencia")).toBeTruthy();
    expect(getByText("Auditado por: Usuario actual")).toBeTruthy();
  });
});
