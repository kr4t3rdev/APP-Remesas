import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ObjectivesScreen } from "./ObjectivesScreen.web";
jest.mock("../../store/themeStore", () => ({ useColors: () => ({ background: "#fff", card: "#fff", border: "#ddd", primary: { 500: "#06c" }, text: { primary: "#111", secondary: "#555", tertiary: "#777" }, danger: "#b00", success: "#070" }) }));
jest.mock("../../components/objectives/ObjectiveFormModal", () => ({ ObjectiveFormModal: () => null }));
jest.mock("../../modules/currencies/application/useCurrencies", () => ({ useCurrenciesWithPrimaryQuery: () => ({ data: { primaryCurrencyId: 1 } }) }));
const mockRefetch = jest.fn();
jest.mock("../../modules/objectives/application/useObjectives", () => ({ useObjectivesQuery: jest.fn(() => ({ data: [], isLoading: false, isError: false, refetch: mockRefetch })), useCreateObjectiveMutation: () => ({ mutateAsync: jest.fn(), isPending: false }), useUpdateObjectiveMutation: () => ({ mutateAsync: jest.fn(), isPending: false }), useUpdateObjectiveStatusMutation: () => ({ mutateAsync: jest.fn() }), useDeleteObjectiveMutation: () => ({ mutateAsync: jest.fn() }) }));
describe("ObjectivesScreen.web", () => { it("renders empty state and refresh control", () => { const screen = render(<ObjectivesScreen />); expect(screen.getByText("Objetivos")).toBeTruthy(); expect(screen.getByText("No hay objetivos con este filtro.")).toBeTruthy(); fireEvent.press(screen.getByTestId("web-objectives-refresh")); expect(mockRefetch).toHaveBeenCalled(); }); });
