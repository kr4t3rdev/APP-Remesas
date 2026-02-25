import React, { useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn, FadeInDown, ScaleIn, StaggerList, LoadingDots, Skeleton } from '../../components/animations';
import { BarChart, HorizontalBarChart, CircularProgress, StatsCard, MiniChart } from '../../components/charts/Charts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { 
    dailyReport, 
    cashBalances, 
    exchangeRates, 
    recentTransactions, 
    activeObjectives,
    isLoading, 
    isRefreshing, 
    refetchAll,
    summary 
  } = useDashboardData();

  const onRefresh = useCallback(() => {
    refetchAll();
  }, [refetchAll]);

  const formatCurrency = (amount: number, currency: string = 'CUP') => {
    return `${currency === 'CUP' ? '$' : currency} ${amount.toLocaleString('es-CU', { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'HH:mm', { locale: es });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: es });
    }
    return format(date, 'dd/MM', { locale: es });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getTransactionIconName = (type: string): keyof typeof Ionicons.glyphMap => {
    if (type === 'COMPRA') return 'arrow-down-circle';
    return 'arrow-up-circle';
  };

  const getCurrencyColor = (code: string) => {
    const colorMap: Record<string, { primary: string; bg: string }> = {
      USD: colors.currencies.usd,
      EUR: colors.currencies.eur,
      MLC: colors.currencies.mlc,
      CUP: colors.currencies.cup,
    };
    return colorMap[code] || colors.currencies.usd;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingDots size={12} color={colors.primary[500]} />
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const transactionChartData = [
    { label: 'Compras', value: summary.transactionSummary.comprasCount, color: colors.financial.compra },
    { label: 'Ventas', value: summary.transactionSummary.ventasCount, color: colors.financial.venta },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <View style={styles.dateCard}>
            <View style={styles.dateIconContainer}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary[500]} />
            </View>
            <View>
              <Text style={styles.dateLabel}>Hoy</Text>
              <Text style={styles.dateText}>
                {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
              </Text>
            </View>
          </View>
        </FadeIn>

        <View style={styles.statsGrid}>
          <ScaleIn delay={150}>
            <StatsCard
              title="Ganancia Hoy"
              value={formatCurrency(summary.todayProfit)}
              icon={<Ionicons name="trending-up" size={20} color={colors.primary[500]} />}
              color={colors.primary[500]}
              trend={summary.todayProfit > 0 ? 'up' : summary.todayProfit < 0 ? 'down' : 'neutral'}
              style={styles.statCard}
            />
          </ScaleIn>
          <ScaleIn delay={200}>
            <StatsCard
              title="Transacciones"
              value={summary.todayTransactions.toString()}
              icon={<Ionicons name="swap-horizontal" size={20} color={colors.secondary[500]} />}
              color={colors.secondary[500]}
              subtitle={`${summary.transactionSummary.comprasCount} compras, ${summary.transactionSummary.ventasCount} ventas`}
              style={styles.statCard}
            />
          </ScaleIn>
        </View>

        <View style={styles.statsGrid}>
          <ScaleIn delay={250}>
            <StatsCard
              title="Gastos Hoy"
              value={formatCurrency(summary.todayExpenses)}
              icon={<Ionicons name="wallet-outline" size={20} color={colors.danger} />}
              color={colors.danger}
              style={styles.statCard}
            />
          </ScaleIn>
          <ScaleIn delay={300}>
            <StatsCard
              title="Balance Caja"
              value={formatCurrency(summary.totalCashBalance)}
              icon={<Ionicons name="cash-outline" size={20} color={colors.accent[500]} />}
              color={colors.accent[500]}
              style={styles.statCard}
            />
          </ScaleIn>
        </View>

        <FadeInDown delay={350}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Balances por Moneda</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {cashBalances?.map((balance, index) => {
                const currencyColor = getCurrencyColor(balance.currency.code);
                return (
                  <ScaleIn key={balance.id} delay={400 + index * 50}>
                    <View style={[styles.currencyCard, { borderLeftColor: currencyColor.primary }]}>
                      <View style={[styles.currencyIcon, { backgroundColor: currencyColor.bg }]}>
                        <Text style={styles.currencySymbol}>{balance.currency.symbol}</Text>
                      </View>
                      <Text style={styles.currencyCode}>{balance.currency.code}</Text>
                      <Text style={styles.currencyBalance}>
                        {balance.balance.toLocaleString('es-CU', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </ScaleIn>
                );
              })}
            </ScrollView>
          </View>
        </FadeInDown>

        <FadeInDown delay={450}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasas de Cambio</Text>
            <View style={styles.ratesContainer}>
              {exchangeRates?.map((rate, index) => {
                const currencyColor = getCurrencyColor(rate.currency.code);
                return (
                  <View key={rate.id} style={styles.rateRow}>
                    <View style={styles.rateCurrencyInfo}>
                      <View style={[styles.rateCurrencyIcon, { backgroundColor: currencyColor.bg }]}>
                        <Text style={styles.rateCurrencySymbol}>{rate.currency.symbol}</Text>
                      </View>
                      <Text style={styles.rateCurrencyName}>{rate.currency.name}</Text>
                    </View>
                    <View style={styles.rateValues}>
                      <View style={styles.rateValueContainer}>
                        <Text style={styles.rateLabel}>Compra</Text>
                        <Text style={[styles.rateValue, { color: colors.financial.compra }]}>
                          {rate.buyRate.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.rateDivider} />
                      <View style={styles.rateValueContainer}>
                        <Text style={styles.rateLabel}>Venta</Text>
                        <Text style={[styles.rateValue, { color: colors.financial.venta }]}>
                          {rate.sellRate.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </FadeInDown>

        <FadeInDown delay={550}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen de Actividad</Text>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Compras vs Ventas</Text>
                <Text style={styles.chartSubtitle}>Transacciones del día</Text>
              </View>
              <BarChart
                data={transactionChartData}
                height={100}
                showLabels
                showValues
                maxValue={Math.max(summary.transactionSummary.comprasCount, summary.transactionSummary.ventasCount, 5)}
              />
            </View>
          </View>
        </FadeInDown>

        {activeObjectives && activeObjectives.length > 0 && (
          <FadeInDown delay={600}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Objetivos</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Ver todo</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {activeObjectives.slice(0, 3).map((objective, index) => (
                  <ScaleIn key={objective.id} delay={650 + index * 50}>
                    <View style={styles.objectiveCard}>
                      <View style={styles.objectiveHeader}>
                        <CircularProgress
                          percentage={objective.percentage}
                          size={60}
                          strokeWidth={6}
                          color={colors.primary[500]}
                        >
                          <Text style={styles.objectivePercentage}>{objective.percentage.toFixed(0)}%</Text>
                        </CircularProgress>
                      </View>
                      <Text style={styles.objectiveName} numberOfLines={1}>{objective.name}</Text>
                      <Text style={styles.objectiveAmount}>
                        {formatCurrency(objective.currentAmount, objective.currency.symbol)} / {formatCurrency(objective.targetAmount, objective.currency.symbol)}
                      </Text>
                    </View>
                  </ScaleIn>
                ))}
              </ScrollView>
            </View>
          </FadeInDown>
        )}

        <FadeInDown delay={700}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Actividad Reciente</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.transactionsContainer}>
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((tx, index) => (
                  <FadeInDown key={tx.id} delay={750 + index * 50}>
                    <TouchableOpacity style={styles.transactionItem}>
                      <View style={[
                        styles.transactionIcon, 
                        { backgroundColor: tx.type === 'COMPRA' ? colors.financial.compraLight : colors.financial.ventaLight }
                      ]}>
                        <Ionicons 
                          name={getTransactionIconName(tx.type)} 
                          size={22} 
                          color={tx.type === 'COMPRA' ? colors.financial.compra : colors.financial.venta} 
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionName}>
                          {tx.type === 'COMPRA' ? 'Compra' : 'Venta'} de {tx.currency.code}
                        </Text>
                        <View style={styles.transactionMeta}>
                          <Text style={styles.transactionAmount}>
                            {tx.amount.toLocaleString()} {tx.currency.code}
                          </Text>
                          <Text style={styles.transactionDot}>•</Text>
                          <Text style={styles.transactionRate}>
                            @ {tx.rate}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text style={[
                          styles.transactionTotal,
                          { color: tx.type === 'COMPRA' ? colors.financial.compra : colors.financial.venta }
                        ]}>
                          {tx.type === 'COMPRA' ? '-' : '+'}{formatCurrency(tx.totalCup)}
                        </Text>
                        <Text style={styles.transactionTime}>{formatTime(tx.createdAt)}</Text>
                      </View>
                    </TouchableOpacity>
                  </FadeInDown>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={48} color={colors.text.tertiary} />
                  <Text style={styles.emptyStateText}>No hay transacciones recientes</Text>
                </View>
              )}
            </View>
          </View>
        </FadeInDown>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.card,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary[500]}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  },
  horizontalScroll: {
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  currencyCard: {
    width: 130,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  currencyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  currencyCode: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  currencyBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  ratesContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rateCurrencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rateCurrencyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateCurrencySymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  rateCurrencyName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  rateValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rateValueContainer: {
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  rateDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  chartHeader: {
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  objectiveCard: {
    width: 160,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  objectiveHeader: {
    marginBottom: spacing.sm,
  },
  objectivePercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  objectiveName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  objectiveAmount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  transactionsContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  transactionDot: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  transactionRate: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionTotal: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
