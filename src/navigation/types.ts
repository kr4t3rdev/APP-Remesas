import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { User } from "../types";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerificationPending: { email?: string };
  ChangePassword: undefined;
  CashHistory: undefined;
  ExchangeRates: undefined;
  BankAccounts: undefined;
  Currencies: undefined;
  AdminUserDetail: { user: User };
  AdminLicensesList: undefined;
  AdminLicenseDetail: { licenseId: string | number };
  AdminAuditLog: undefined;
  AdminExportReports: undefined;
  AdminProfile: undefined;
  BusinessWorkers: undefined;
  UIWorkersRedirect: undefined;
  Reports: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Cash: undefined;
  Expenses: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  AdminHome: undefined;
  AdminServices: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
  AdminProfile: undefined;
};

export type AdminStackParamList = {
  AdminServicesList: undefined;
  AdminPlansList: undefined;
  AdminPlanCreate: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  NativeStackScreenProps<MainTabParamList, T>;
