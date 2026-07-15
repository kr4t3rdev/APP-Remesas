import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { TransactionsScreen } from "./TransactionsScreen";

jest.mock("../../components/business/modals/TransactionModal", () => ({
  TransactionModal: ({ visible }: { visible: boolean }) =>
    visible ? (() => { const NativeText = require("react-native").Text; return <NativeText>Account-aware transaction modal</NativeText>; })() : null,
}));
jest.mock("../../modules/transactions/application/useTransactions", () => ({
  useTransactionsQuery: () => ({ data: [], isRefetching: false, refetch: jest.fn() }),
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
