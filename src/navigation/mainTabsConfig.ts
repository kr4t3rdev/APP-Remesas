import type { MainTabParamList } from "./types";
import type { Ionicons } from "@expo/vector-icons";

type MainTabDefinition = {
  route: keyof MainTabParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  emphasized?: boolean;
};

export const mainTabDefinitions: readonly MainTabDefinition[] = [
  { route: "Home", label: "Inicio", icon: "home" },
  { route: "Transactions", label: "Transacciones", icon: "swap-horizontal" },
  { route: "Cash", label: "Cash", icon: "wallet", emphasized: true },
  { route: "Expenses", label: "Gastos", icon: "receipt" },
  { route: "Profile", label: "Perfil", icon: "person" },
];
