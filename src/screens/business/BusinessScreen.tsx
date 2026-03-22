import React, { useState } from 'react';
import { TransactionsTab } from './tabs/TransactionsTab';
import { WorkersTab } from './tabs/WorkersTab';
import { BanksTab } from './tabs/BanksTab';
import { CurrenciesTab } from './tabs/CurrenciesTab';
import { CashRegisterTab } from './tabs/CashRegisterTab';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioLiquidityCard } from './components/PortfolioLiquidityCard';
import { TabSelector, TabItem } from './components/TabSelector';
import { ExchangeRatesScreen } from '../exchange-rates/ExchangeRatesScreen';
import { ExchangeTab } from './tabs/ExchangesTab';

const BUSINESS_TABS: TabItem[] = [
  { key: 'transactions', label: 'Transacciones' },
  { key: 'workers', label: 'Trabajadores' },
  { key: 'banks', label: 'Cuentas Bancarias' },
  { key: 'currencies', label: 'Monedas' },
  { key: 'cash', label: 'Cash' },
  {key: 'tasa_cambio', label: 'Tasa de Cambio'},
];

const Header = () => {
  const colors = useColors();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity>
          {/* <Ionicons name="menu-outline" size={28} color={colors.primary[500]} /> */}
        </TouchableOpacity>
        <TouchableOpacity>
          {/* <Ionicons name="search-outline" size={24} color={colors.primary[500]} /> */}
        </TouchableOpacity>
      </View>
      
      <View style={styles.titleSection}>
        <Text style={[styles.topBarTitle, { color: colors.text.primary }]}>Business</Text>
        <Text style={[styles.superTitle, { color: colors.text.secondary }]}>Todo lo realcionado con tu negocio</Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  titleSection: {
    marginBottom: 10,
  },
  superTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
    letterSpacing: -1.5,
  },
});

export const BusinessScreen = () => {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<string>('transactions');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'transactions': return <TransactionsTab />;
      case 'workers': return <WorkersTab />;
      case 'banks': return <BanksTab />;
      case 'currencies': return <CurrenciesTab />;
      case 'cash': return <CashRegisterTab />;
      case 'tasa_cambio': return <ExchangeTab /> ;
      default: return <TransactionsTab />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header />
      <TabSelector 
        tabs={BUSINESS_TABS} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <View style={{ flex: 60 }}>
        {renderActiveTab()}
      </View>
    </SafeAreaView>
  );
};
