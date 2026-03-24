import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TransactionModal } from "../TransactionModal";
import * as businessQueries from "../../../../hooks/queries/useBusinessQueries";

describe("TransactionModal", () => {
  const mockOnClose = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(businessQueries, "useCreateTransaction").mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it("renders correctly when visible", () => {
    const { getByText, getByPlaceholderText } = render(
      <TransactionModal visible={true} onClose={mockOnClose} />,
    );

    expect(getByText("Nueva Transacción")).toBeTruthy();
    expect(getByPlaceholderText("Monto")).toBeTruthy();
  });

  it("calls onClose when Cancelar is pressed", () => {
    const { getByText } = render(
      <TransactionModal visible={true} onClose={mockOnClose} />,
    );

    fireEvent.press(getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls mutate with correct data when Guardar is pressed", () => {
    const { getByText, getByPlaceholderText } = render(
      <TransactionModal visible={true} onClose={mockOnClose} />,
    );

    const input = getByPlaceholderText("Monto");
    fireEvent.changeText(input, "150");

    fireEvent.press(getByText("Guardar"));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 150,
        type: "BUY",
        sourceCurrency: "USD",
        targetCurrency: "EUR",
      }),
      expect.any(Object),
    );
  });

  it("does not call mutate if amount is empty", () => {
    const { getByText } = render(
      <TransactionModal visible={true} onClose={mockOnClose} />,
    );

    fireEvent.press(getByText("Guardar"));
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
