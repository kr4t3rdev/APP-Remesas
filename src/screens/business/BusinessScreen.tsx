import React, { useState } from "react";
import { TransactionsTab } from "./tabs/TransactionsTab";
import { WorkersTab } from "./tabs/WorkersTab";
import { BanksTab } from "./tabs/BanksTab";
import { CurrenciesTab } from "./tabs/CurrenciesTab";
import { CashRegisterTab } from "./tabs/CashRegisterTab";
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "../../store/themeStore";
import { TabSelector, TabItem } from "./components/TabSelector";
import { ExchangeTab } from "./tabs/ExchangesTab";

const BUSINESS_TABS: TabItem[] = [
  {
    key: "transactions",
    label: "Transacciones",
    icon: "swap-horizontal-outline",
  },
  { key: "workers", label: "Trabajadores", icon: "people-outline" },
  {
    key: "banks",
    label: "Cuentas bancarias",
    icon: "business-outline",
  },
  { key: "currencies", label: "Monedas", icon: "cash-outline" },
  { key: "cash", label: "Caja", icon: "wallet-outline" },
  {
    key: "tasa_cambio",
    label: "Tasas de cambio",
    icon: "trending-up-outline",
  },
];

const Header = () => {
  const colors = useColors();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <Text style={[styles.topBarTitle, { color: colors.text.primary }]}>
          Negocios
        </Text>
        <Text style={[styles.superTitle, { color: colors.text.secondary }]}>
          Administra los módulos de tu negocio
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 5,
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  titleSection: {
    marginBottom: 10,
  },
  superTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: "800",
    lineHeight: 52,
    letterSpacing: -1.5,
  },
});

export const BusinessScreen = () => {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<string>("transactions");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "transactions":
        return <TransactionsTab />;
      case "workers":
        return <WorkersTab />;
      case "banks":
        return <BanksTab />;
      case "currencies":
        return <CurrenciesTab />;
      case "cash":
        return <CashRegisterTab />;
      case "tasa_cambio":
        return <ExchangeTab />;
      default:
        return <TransactionsTab />;
    }
  };

  return (
    <SafeAreaView accessibilityLabel="Gestión del negocio" style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header />
      <TabSelector
        tabs={BUSINESS_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <View style={{ flex: 60 }}>{renderActiveTab()}</View>
    </SafeAreaView>
  );
};
