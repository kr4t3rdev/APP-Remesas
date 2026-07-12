import api from "../../../services/api";
import type { BankAccount, Currency } from "../../../types";

type CreateBankAccountDto = {
  name: string;
  bankName: string;
  currencyId: number;
  accountNumber: string;
  initialBalance?: number;
  isActive?: boolean;
};

type UpdateBankAccountDto = Partial<CreateBankAccountDto>;

type BankAccountBalance = {
  id: number;
  name: string;
  balance: number;
  currency: Currency;
};

type BankAccountTransactions = {
  expenses: any[];
  incomes: any[];
};

export const bankAccountsRepository = {
  async getAll(): Promise<BankAccount[]> {
    const response = await api.get<BankAccount[]>("/bank-accounts");
    return response.data!;
  },

  async getOne(id: number): Promise<BankAccount> {
    const response = await api.get<BankAccount>(`/bank-accounts/${id}`);
    return response.data!;
  },

  async create(data: CreateBankAccountDto): Promise<BankAccount> {
    const response = await api.post<BankAccount>("/bank-accounts", data);
    return response.data!;
  },

  async update(id: number, data: UpdateBankAccountDto): Promise<BankAccount> {
    const response = await api.patch<BankAccount>(`/bank-accounts/${id}`, data);
    return response.data!;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/bank-accounts/${id}`);
  },

  async getBalance(id: number): Promise<BankAccountBalance> {
    const response = await api.get<BankAccountBalance>(
      `/bank-accounts/${id}/balance`,
    );
    return response.data!;
  },

  async getTransactions(id: number): Promise<BankAccountTransactions> {
    const response = await api.get<BankAccountTransactions>(
      `/bank-accounts/${id}/transactions`,
    );
    return response.data!;
  },
};
