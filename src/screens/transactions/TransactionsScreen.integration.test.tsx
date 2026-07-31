import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { TransactionsScreen } from "./TransactionsScreen";

const mockUseTransactionsQuery = jest.fn((_params?: unknown) => ({
  data: [],
  isRefetching: false,
  refetch: jest.fn(),
}));

jest.mock("../../components/business/modals/TransactionModal", () => ({
  TransactionModal: ({ visible }: { visible: boolean }) =>
    visible ? (() => { const NativeText = require("react-native").Text; return <NativeText>Account-aware transaction modal</NativeText>; })() : null,
}));
jest.mock("../../modules/transactions/application/useTransactions", () => ({
  useTransactionsQuery: (params?: unknown) => mockUseTransactionsQuery(params),
  useCurrenciesQuery: () => ({ data: [] }),
  useExchangeRatesQuery: () => ({ data: [] }),
  usePositionsQuery: () => ({ data: [] }),
  useCreateTransactionMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock("../../store/themeStore", () => ({ useColors: () => ({ background: "#fff", card: "#fff", surface: "#eee", border: "#ddd", text: { primary: "#111", secondary: "#666", tertiary: "#999" }, primary: { 400: "#09f", 500: "#07f" }, financial: { compra: "#0a0", compraLight: "#afa", venta: "#a00", ventaLight: "#faa" }, currencies: { usd: { primary: "#07f" }, eur: { primary: "#07f" }, mlc: { primary: "#07f" } } }), useShadows: () => ({ md: {}, sm: {}, lg: {}, glow: {} }) }));
jest.mock("../../navigation/TabBarMotionProvider", () => ({
  useTabBarScrollBehavior: () => ({}),
  useTabScrollToTop: jest.fn(),
}));

test("opens the account-aware transfer modal from the real TransactionsScreen flow", () => {
  const { getByLabelText, getByText } = render(<TransactionsScreen />);
  fireEvent.press(getByLabelText("Nueva transacción"));
  expect(getByText("Account-aware transaction modal")).toBeTruthy();
});

test("renders the transactions header and exposes the current filter", () => {
  const { getByRole, getByText } = render(<TransactionsScreen />);

  expect(getByRole("header", { name: "Transacciones" })).toBeTruthy();
  expect(getByText("Compras, ventas y remesas")).toBeTruthy();
  expect(getByRole("button", { name: "Filtrar transacciones. Filtro actual: Todas" })).toBeTruthy();
});

test("opens an accessible filter sheet and applies a selection", () => {
  const { getByLabelText, getByRole, queryByLabelText } = render(<TransactionsScreen />);

  fireEvent.press(
    getByRole("button", { name: "Filtrar transacciones. Filtro actual: Todas" }),
  );

  expect(getByLabelText("Filtros de transacciones")).toBeTruthy();
  fireEvent.press(getByRole("radio", { name: "Compras" }));

  expect(queryByLabelText("Filtros de transacciones")).toBeNull();
  expect(
    getByRole("button", { name: "Filtrar transacciones. Filtro actual: Compras" }),
  ).toBeTruthy();
});

test("filters remittances independently from purchase and sale types", () => {
  const { getByLabelText, getByRole } = render(<TransactionsScreen />);

  fireEvent.press(
    getByRole("button", { name: "Filtrar transacciones. Filtro actual: Todas" }),
  );
  expect(getByLabelText("Tipo de transacción").props.accessibilityRole).toBe(
    "radiogroup",
  );
  fireEvent.press(getByRole("radio", { name: "Remesas" }));

  expect(mockUseTransactionsQuery).toHaveBeenLastCalledWith({
    operationKind: "REMITTANCE",
  });
});

test.each([
  ["Compras", "COMPRA"],
  ["Ventas", "VENTA"],
] as const)("filters %s as transfers rather than mixing in remittances", (label, type) => {
  const { getByRole } = render(<TransactionsScreen />);

  fireEvent.press(
    getByRole("button", { name: "Filtrar transacciones. Filtro actual: Todas" }),
  );
  fireEvent.press(getByRole("radio", { name: label }));

  expect(mockUseTransactionsQuery).toHaveBeenLastCalledWith({
    type,
    operationKind: "TRANSFER",
  });
});
