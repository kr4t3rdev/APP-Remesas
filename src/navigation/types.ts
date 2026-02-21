import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Cash: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = NativeStackScreenProps<MainTabParamList, T>;
