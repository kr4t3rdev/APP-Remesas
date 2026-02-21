import { create } from 'zustand';
import type { DailyReport, CashBalance } from '../types';

type DashboardState = {
  dailyReport: DailyReport | null;
  cashBalances: CashBalance[];
  isLoading: boolean;
  error: string | null;
  
  setDailyReport: (report: DailyReport | null) => void;
  setCashBalances: (balances: CashBalance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const initialState = {
  dailyReport: null,
  cashBalances: [],
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,

  setDailyReport: (report) => set({ dailyReport: report }),
  setCashBalances: (balances) => set({ cashBalances: balances }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
