import type { Worker, Currency, ExchangeRate } from "../../../types";

export type TopWorkerEntry = {
  id: number;
  name: string;
  initials: string;
  totalBalanceInPrimary: number;
  hasUnconvertedBalance: boolean;
};

type Options = {
  primaryCurrencyId: number | null | undefined;
  limit?: number;
};

const DEFAULT_LIMIT = 5;

const getBalanceForCurrency = (
  balances: Worker["balances"],
  currencyId: number,
): number => {
  const match = balances?.find((balance) => balance.currencyId === currencyId);
  return match ? Number(match.balance) || 0 : 0;
};

const findSellRate = (
  rates: ExchangeRate[] | undefined,
  currencyId: number,
): number => {
  const latestByCurrency = new Map<number, ExchangeRate>();
  for (const rate of rates ?? []) {
    const current = latestByCurrency.get(rate.currencyId);
    const currentTime = current?.effectiveDate
      ? Date.parse(current.effectiveDate)
      : 0;
    const itemTime = rate.effectiveDate ? Date.parse(rate.effectiveDate) : 0;
    if (!current || itemTime > currentTime || (itemTime === currentTime && rate.id > current.id)) {
      latestByCurrency.set(rate.currencyId, rate);
    }
  }
  const latest = latestByCurrency.get(currencyId);
  return latest ? Number(latest.sellRate) || 0 : 0;
};

export const selectTopWorkersByBalance = (
  workers: Worker[] | undefined,
  rates: ExchangeRate[] | undefined,
  { primaryCurrencyId, limit = DEFAULT_LIMIT }: Options,
): TopWorkerEntry[] => {
  if (!workers || workers.length === 0 || !primaryCurrencyId) return [];

  const ranked = workers
    .map<TopWorkerEntry>((worker) => {
      let total = 0;
      let hasUnconvertedBalance = false;
      for (const balance of worker.balances ?? []) {
        const amount = Number(balance.balance) || 0;
        if (balance.currencyId === primaryCurrencyId) {
          total += amount;
          continue;
        }
        const rate = findSellRate(rates, balance.currencyId);
        if (rate <= 0) {
          hasUnconvertedBalance = true;
          continue;
        }
        total += amount * rate;
      }
      return {
        id: worker.id,
        name: worker.name,
        initials: worker.initials ?? deriveInitials(worker.name),
        totalBalanceInPrimary: total,
        hasUnconvertedBalance,
      };
    })
    .sort((a, b) => b.totalBalanceInPrimary - a.totalBalanceInPrimary)
    .slice(0, limit);

  return ranked;
};

const deriveInitials = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "TR";
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.substring(0, 2).toUpperCase() ?? "";
  const second = parts[1]?.substring(0, 1).toUpperCase() ?? "";
  return `${first}${second}` || "TR";
};

export const formatPrimaryBalance = (
  amount: number,
  primaryCurrency: Currency | null | undefined,
): string => {
  if (!primaryCurrency) return "—";
  const identity = primaryCurrency.symbol || primaryCurrency.code || "";
  return `${identity}${identity ? " " : ""}${amount.toLocaleString("es-CU", { minimumFractionDigits: 2 })}`;
};
