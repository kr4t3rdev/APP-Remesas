import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { ExchangeRatesScreen } from "../ExchangeRatesScreen.web";
const mockRefetch = jest.fn(); const mockMutateAsync = jest.fn();
jest.mock("../../../store/themeStore", () => ({ useColors: () => ({ background: "#fff", card: "#fff", border: "#ddd", primary: { 500: "#05c", 600: "#04a" }, text: { primary: "#111", secondary: "#555", tertiary: "#888" }, danger: "#c00" }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("../../../modules/currencies/application/useCurrencies", () => ({ useCurrenciesWithPrimaryQuery: () => ({ data: { primaryCurrencyId: 1, currencies: [{ id: 1, code: "CUP", name: "Peso", symbol: "$" }, { id: 2, code: "USD", name: "Dólar", symbol: "US$" }] }, isLoading: false, isError: false, refetch: mockRefetch }) }));
jest.mock("../../../modules/exchange-rates/application/useExchangeRates", () => ({ useCurrentExchangeRatesQuery: () => ({ data: [{ id: 3, currencyId: 2, currency: { id: 2, code: "USD", name: "Dólar", symbol: "US$" }, referenceRate: 400, buyRate: 390, sellRate: 410 }], isLoading: false, isError: false, refetch: mockRefetch }), useRateHistoryQuery: () => ({ data: [], isLoading: false, refetch: mockRefetch }), useUpdateExchangeRateMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }) }));
describe("ExchangeRatesScreen.web", () => { it("renders current rates and supports refresh", () => { const { getByText, getByLabelText } = render(<ExchangeRatesScreen />); expect(getByText("Tasas de cambio")).toBeTruthy(); expect(getByText("400.0000")).toBeTruthy(); fireEvent.press(getByLabelText("Actualizar tasas")); expect(mockRefetch).toHaveBeenCalled(); }); });
