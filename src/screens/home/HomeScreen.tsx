import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceCard } from '../../components/features/Dashboard/BalanceCard';
import { TransactionSummaryCard } from '../../components/features/Dashboard/TransactionSummaryCard';
import { QuickActionCard } from '../../components/features/Dashboard/QuickActionCard';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { reportService, cashBalanceService } from '../../services/finance.service';
import type { DailyReport, CashBalance } from '../../types';

export const HomeScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [cashBalances, setCashBalances] = useState<CashBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [report, balances] = await Promise.all([
        reportService.getDaily(),
        cashBalanceService.getAll(),
      ]);
      setDailyReport(report);
      setCashBalances(balances);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const quickActions = [
    {
      id: 'buy',
      title: 'Compra',
      subtitle: 'Divisas',
      icon: '💰',
      color: colors.primary[500],
      onPress: () => Alert.alert('Navegar a Compra'),
    },
    {
      id: 'sell',
      title: 'Venta',
      subtitle: 'Divisas',
      icon: '💸',
      color: colors.success,
      onPress: () => Alert.alert('Navegar a Venta'),
    },
    {
      id: 'audit',
      title: 'Arqueo',
      subtitle: 'De Caja',
      icon: '📋',
      color: colors.warning,
      onPress: () => Alert.alert('Navegar a Arqueo'),
    },
    {
      id: 'expense',
      title: 'Gasto',
      subtitle: 'Registrar',
      icon: '📝',
      color: colors.danger,
      onPress: () => Alert.alert('Navegar a Gasto'),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary }}>
            Hola, {user?.name || 'Usuario'}
          </Text>
          <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {dailyReport && <TransactionSummaryCard report={dailyReport} />}

        <View style={{ marginTop: spacing.md }}>
          <QuickActionCard actions={quickActions} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <BalanceCard balances={cashBalances} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
