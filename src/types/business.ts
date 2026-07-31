import type { Currency, Transaction, TransactionType } from "./index";

export type Position = {
  currencyId: number;
  currency?: Currency | string;
  saldo: number;
  costoPromedio: number | null;
  availableForSale: boolean;
  reviewStatus?: "UNREVIEWED" | "REVIEWED";
  reviewedAt?: string | null;
};

export const isPositionReviewable = (position: Position): boolean =>
  position.reviewStatus === "UNREVIEWED"
  || (position.reviewStatus === undefined
    && position.saldo > 0
    && position.costoPromedio === null
    && !position.availableForSale);

export type TransferRequest = {
  type: TransactionType;
  currencyId: number;
  amount: number;
  rate: number;
  operationKind?: "TRANSFER" | "REMITTANCE";
  persistRate?: boolean;
  notes?: string;
  idempotencyKey: string;
  sourceType?: "CASH" | "BANK_ACCOUNT";
  sourceBankAccountId?: number;
  destinationType?: "CASH" | "BANK_ACCOUNT";
  destinationBankAccountId?: number;
  workerId?: number;
  workerProfit?: number;
  workerCurrencyId?: number;
};

export type TransferTransaction = Transaction & {
  movementId?: number;
  lifecycleState?: string;
  appliedRate?: number;
  requestedRate?: number;
  operationKind?: "TRANSFER" | "REMITTANCE";
  persistRate?: boolean;
  rendimiento?: number | null;
  position?: Position;
};

export type TransferResponse = {
  transaction: TransferTransaction;
  movement?: { id: number };
};

export type OpenPositionRequest = {
  currencyId: number;
  openingCost: number;
};

export type OpenPositionResponse = {
  position: Position;
  movement: { id: number };
};

export type RemittanceStatus = "PENDING" | "FAILED" | "COMPLETED";

export type Remittance = {
  id: number;
  provider: string;
  sourceId: string;
  status: RemittanceStatus;
  createdAt?: string;
  movements?: Array<{ id: number; currencyId: number; amount: number; rendimiento?: number | null }>;
  duplicate?: boolean;
};

export type FxPerformanceReport = {
  period: { startDate: string; endDate: string };
  currency: string | null;
  totalRendimiento: number;
  movements: Array<{
    id: number;
    currency: string;
    amount: number;
    rate: number;
    costoPromedio: number;
    rendimiento: number;
    createdAt: string;
  }>;
  positions: Position[];
};

export type TransferPreview = {
  totalBase: number;
  currentSaldo: number | null;
  currentCostoPromedio: number | null;
  projectedSaldo: number | null;
  projectedCostoPromedio: number | null;
  expectedRendimiento: number | null;
  isValid: boolean;
  validationMessage?: string;
};

export const calculateTransferPreview = ({
  type,
  amount,
  rate,
  position,
}: {
  type: TransactionType;
  amount: number;
  rate: number;
  position?: Position;
}): TransferPreview => {
  const totalBase = amount > 0 && rate > 0 ? amount * rate : 0;
  const currentSaldo = position?.saldo ?? null;
  const currentCostoPromedio = position?.costoPromedio ?? null;
  if (!position || amount <= 0 || rate <= 0) {
    return { totalBase, currentSaldo, currentCostoPromedio, projectedSaldo: null, projectedCostoPromedio: null, expectedRendimiento: null, isValid: false, validationMessage: "Ingresa un monto y una tasa válidos" };
  }
  if (type === "VENTA") {
    const available = position.availableForSale && position.saldo >= amount;
    return {
      totalBase,
      currentSaldo,
      currentCostoPromedio,
      projectedSaldo: available ? position.saldo - amount : null,
      projectedCostoPromedio: available ? position.costoPromedio : null,
      expectedRendimiento: available && position.costoPromedio != null ? (rate - position.costoPromedio) * amount : null,
      isValid: available,
      validationMessage: available ? undefined : "La venta supera el saldo disponible o la posición no está revisada",
    };
  }
  const projectedSaldo = position.saldo + amount;
  const projectedCostoPromedio = position.costoPromedio == null || position.saldo === 0
    ? rate
    : (position.saldo * position.costoPromedio + totalBase) / projectedSaldo;
  return { totalBase, currentSaldo, currentCostoPromedio, projectedSaldo, projectedCostoPromedio, expectedRendimiento: null, isValid: true };
};

export type Worker = { id: string; name: string; currentBalance: number; accumulatedProfit: number };
export type BankAccount = { id: string; name: string; bankName: string; currencyCode: string; balance: number };
export type CashMovement = { id: string; date: string; type: "IN" | "OUT" | "ADJUSTMENT"; amount: number; description: string };
export type CashReconciliation = { id: string; date: string; registeredBalance: number; countedBalance: number; result: "SOBRANTE" | "FALTANTE" | "CUADRADO"; difference: number };
