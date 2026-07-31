import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Alert } from "../../utils/alert";
import { ExpensesScreen } from "./ExpensesScreen";

const mockDeleteMutateAsync = jest.fn();
const mockGetExpenses = jest.fn();

jest.mock("../../modules/expenses/application/useExpenses", () => {
  const mockUseExpensesQuery = jest.fn();
  return {
    useExpensesQuery: mockUseExpensesQuery,
    useCreateExpenseMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
    useUpdateExpenseMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
    useDeleteExpenseMutation: () => ({ mutateAsync: mockDeleteMutateAsync, isPending: false }),
    __mockUseExpensesQuery: mockUseExpensesQuery,
  };
});

const getMockUseExpensesQuery = () =>
  require("../../modules/expenses/application/useExpenses").__mockUseExpensesQuery;

getMockUseExpensesQuery().mockReturnValue({
  data: [
    {
      id: 42,
      description: "Internet",
      amount: 100,
      category: "servicios",
      date: "2026-03-06",
      currencyId: 1,
      currency: { id: 1, code: "CUP", symbol: "$" },
      sourceType: "CASH",
      notes: null,
      sourceBankAccountId: null,
      createdAt: "2026-03-06T00:00:00Z",
      updatedAt: "2026-03-06T00:00:00Z",
    },
  ],
  refetch: mockGetExpenses,
  isRefetching: false,
  isLoading: false,
  isError: false,
});

jest.mock("../../components/animations", () => ({
  FadeInDown: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../navigation/fintechTabBar", () => ({
  floatingTabBarMetrics: { standaloneActionBottom: 80 },
}));

jest.mock("../../navigation/TabBarMotionProvider", () => ({
  useTabBarScrollBehavior: () => ({}),
  useTabScrollToTop: () => {},
}));

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

jest.mock("../../store/themeStore", () => ({
  useColors: () => ({
    background: "#fff",
    card: "#fff",
    border: "#ddd",
    primary: { 50: "#eef", 500: "#00f" },
    text: { primary: "#111", secondary: "#555", tertiary: "#999", inverse: "#fff" },
    danger: "#f00",
  }),
  useShadows: () => ({ sm: {}, lg: {} }),
}));

jest.mock("../../components/expenses/ExpenseCard", () => ({
  ExpenseCard: ({ onDelete }: { onDelete: (e: unknown) => void }) => {
    const { TouchableOpacity } = require("react-native");
    return (
      <TouchableOpacity testID="expense-card-delete" onPress={() => onDelete({ id: 42 })} />
    );
  },
}));

jest.mock("../../components/expenses/ExpenseFormModal", () => ({
  ExpenseFormModal: () => null,
}));

jest.mock("../../components/ui/ConfirmModal", () => {
  const { TouchableOpacity } = require("react-native");
  return {
    ConfirmModal: ({ visible, onConfirm }: { visible: boolean; onConfirm: () => void }) =>
      visible ? (
        <TouchableOpacity testID="confirm-modal-confirm" onPress={onConfirm} />
      ) : null,
  };
});

const renderScreen = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ExpensesScreen />
    </QueryClientProvider>,
  );
};

describe("ExpensesScreen total widget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMockUseExpensesQuery().mockReturnValue({
      data: [],
      refetch: jest.fn(),
      isRefetching: false,
      isLoading: false,
      isError: false,
    });
  });

  it("groups total expenses by currency code", async () => {
    getMockUseExpensesQuery().mockReturnValueOnce({
      data: [
        {
          id: 1,
          description: "Internet",
          amount: 100,
          category: "servicios",
          date: "2026-03-06",
          currencyId: 2,
          currency: { id: 2, code: "USD", symbol: "$" },
          sourceType: "CASH",
          notes: null,
          sourceBankAccountId: null,
        },
        {
          id: 2,
          description: "Dominio",
          amount: 50,
          category: "servicios",
          date: "2026-03-07",
          currencyId: 2,
          currency: { id: 2, code: "USD", symbol: "$" },
          sourceType: "CASH",
          notes: null,
          sourceBankAccountId: null,
        },
        {
          id: 3,
          description: "Renta",
          amount: 5000,
          category: "renta",
          date: "2026-03-08",
          currencyId: 1,
          currency: { id: 1, code: "CUP", symbol: "$" },
          sourceType: "CASH",
          notes: null,
          sourceBankAccountId: null,
        },
      ],
      refetch: jest.fn(),
      isRefetching: false,
      isLoading: false,
      isError: false,
    });

    const view = renderScreen();

    expect(await view.findByTestId("expense-total-USD")).toBeTruthy();
    expect(await view.findByTestId("expense-total-CUP")).toBeTruthy();
  });
});

describe("ExpensesScreen error surfacing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMockUseExpensesQuery().mockReturnValue({
      data: [
        {
          id: 42,
          description: "Internet",
          amount: 100,
          category: "servicios",
          date: "2026-03-06",
          currencyId: 1,
          currency: { id: 1, code: "CUP", symbol: "$" },
          sourceType: "CASH",
          notes: null,
          sourceBankAccountId: null,
          createdAt: "2026-03-06T00:00:00Z",
          updatedAt: "2026-03-06T00:00:00Z",
        },
      ],
      refetch: mockGetExpenses,
      isRefetching: false,
      isLoading: false,
      isError: false,
    });
  });

  it("surfaces the backend error message when delete fails", async () => {
    mockDeleteMutateAsync.mockRejectedValueOnce({
      response: { data: { message: "Gasto con transacciones activas" } },
    });
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const view = renderScreen();

    fireEvent.press(view.getByTestId("expense-card-delete"));

    await waitFor(() => {
      expect(view.getByTestId("confirm-modal-confirm")).toBeTruthy();
    });

    fireEvent.press(view.getByTestId("confirm-modal-confirm"));

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith(42);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Error",
        "Gasto con transacciones activas",
      );
    });

    alertSpy.mockRestore();
  });
});
