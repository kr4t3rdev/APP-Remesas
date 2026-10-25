import api from "../../../services/api";
import { toDecimalString } from "../../../utils/decimalString";
import type {
  Currency,
  ExchangeRate,
  Transaction,
  TransactionType,
} from "../../../types";
import type {
  OpenPositionRequest,
  OpenPositionResponse,
  Position,
  Remittance,
  TransferRequest,
  TransferResponse,
} from "../../../types/business";

type ExchangeRatesResponse = {
  rates: ExchangeRate[];
};

export const transactionsRepository = {
  async getPositions(): Promise<Position[]> {
    const response = await api.get<{ positions: Position[] }>("/reports/fx-performance", { params: { startDate: "2000-01-01", endDate: "2100-01-01" } });
    return response.data?.positions ?? [];
  },

  async getRemittances(): Promise<Remittance[]> {
    const response = await api.get<Remittance[]>("/remittances");
    return response.data ?? [];
  },
  async getTransactions(params?: {
    type?: TransactionType;
    operationKind?: "TRANSFER" | "REMITTANCE";
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>("/transactions", { params });
    return response.data!;
  },

  async createTransaction(data: TransferRequest): Promise<TransferResponse> {
    const { idempotencyKey, ...rest } = data;
    if (!idempotencyKey) throw new Error("Idempotency-Key is required for a transfer intent");
    // Decisión 1.14: los importes y tasas viajan como decimal-string.
    const request = {
      ...rest,
      amount: toDecimalString(data.amount),
      rate: toDecimalString(data.rate),
      ...(data.workerProfit !== undefined
        ? { workerProfit: toDecimalString(data.workerProfit) }
        : {}),
    };
    const response = await api.post<TransferResponse>("/fx-operations/transfers", request, { headers: { "Idempotency-Key": idempotencyKey } });
    return response.data!;
  },

  async openPosition(data: OpenPositionRequest): Promise<OpenPositionResponse> {
    const response = await api.post<OpenPositionResponse>("/fx-operations/positions/open", {
      ...data,
      openingCost: toDecimalString(data.openingCost),
    });
    if (!response.data) throw new Error("No se pudo abrir la posición histórica");
    return response.data;
  },

  async getCurrencies(): Promise<Currency[]> {
    const response = await api.get<Currency[]>("/currencies");
    return response.data!;
  },

  async getExchangeRates(): Promise<ExchangeRate[]> {
    const response = await api.get<ExchangeRatesResponse>("/exchange-rates");
    return response.data!.rates ?? [];
  },
};
