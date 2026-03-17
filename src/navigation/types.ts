import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { User } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  ChangePassword: undefined;
  CashHistory: undefined;
  ExchangeRates: undefined;
  BankAccounts: undefined;
  Currencies: undefined;
  ReconciliationsHistory: undefined;
  BulkReconciliation: undefined;
  AdminUserDetail: { user: User };
  AdminLicensesList: undefined;
  AdminLicenseDetail: { licenseId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Cash: undefined;
  Reports: undefined;
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

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = NativeStackScreenProps<MainTabParamList, T>;
