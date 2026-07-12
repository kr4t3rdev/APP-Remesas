import React, { useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  FadeIn,
  FadeInDown,
  ScaleIn,
  PressableScale,
  LoadingDots,
} from "../../components/animations";
import {
  BarChart,
  CircularProgress,
  StatsCard,
} from "../../components/charts/Charts";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useAuthStore } from "../../store/authStore";
import {
  useColors,
  useShadows,
  useIsDark,
  useGradients,
} from "../../store/themeStore";
import { spacing, borderRadius } from "../../theme";
import { floatingTabBarMetrics } from "../../navigation/fintechTabBar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const HomeScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const themeColors = useColors();
  const themeShadows = useShadows();
  const isDark = useIsDark();
  const gradients = useGradients();

  const {
    dailyReport,
    cashBalances,
    exchangeRates,
    recentTransactions,
    activeObjectives,
    isLoading,
    isRefreshing,
    refetchAll,
    summary,
  } = useDashboardData();

  const onRefresh = useCallback(() => {
    refetchAll();
  }, [refetchAll]);

  const formatCurrency = (amount: number, currency: string = "CUP") => {
    return `${currency === "CUP" ? "$" : currency} ${amount.toLocaleString("es-CU", { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return format(date, "HH:mm", { locale: es });
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return format(date, "EEEE", { locale: es });
    }
    return format(date, "dd/MM", { locale: es });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getTransactionIconName = (
    type: string,
  ): keyof typeof Ionicons.glyphMap => {
    if (type === "COMPRA") return "arrow-down-circle";
    return "arrow-up-circle";
  };

  const getCurrencyColor = (code: string) => {
    const colorMap: Record<string, { primary: string; bg: string }> = {
      USD: themeColors.currencies.usd,
      EUR: themeColors.currencies.eur,
      MLC: themeColors.currencies.mlc,
      CUP: themeColors.currencies.cup,
    };
    return colorMap[code] || themeColors.currencies.usd;
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.loadingContainer}>
          <LoadingDots size={12} color={themeColors.primary[500]} />
          <Text
            style={[styles.loadingText, { color: themeColors.text.secondary }]}
          >
            Cargando dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const transactionChartData = [
    {
      label: "Compras",
      value: summary.transactionSummary.comprasCount,
      color: themeColors.financial.compra,
    },
    {
      label: "Ventas",
      value: summary.transactionSummary.ventasCount,
      color: themeColors.financial.venta,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary[500]}
            colors={[themeColors.primary[500]]}
          />
        }
      >
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View>
              <Text
                style={[styles.greeting, { color: themeColors.text.secondary }]}
              >
                {getGreeting()}
              </Text>
              <Text
                style={[styles.userName, { color: themeColors.text.primary }]}
              >
                {user?.name || "Usuario"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.notificationButton,
                { backgroundColor: themeColors.card },
                themeShadows.sm,
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={themeColors.text.primary}
              />
              <View
                style={[
                  styles.notificationBadge,
                  { backgroundColor: themeColors.danger },
                ]}
              />
            </TouchableOpacity>
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <View
            style={[
              styles.dateCard,
              { backgroundColor: themeColors.card },
              themeShadows.sm,
            ]}
          >
            <View
              style={[
                styles.dateIconContainer,
                { backgroundColor: `${themeColors.primary[500]}15` },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={themeColors.primary[500]}
              />
            </View>
            <View>
              <Text
                style={[
                  styles.dateLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Hoy
              </Text>
              <Text
                style={[styles.dateText, { color: themeColors.text.primary }]}
              >
                {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
              </Text>
            </View>
          </View>
        </FadeIn>

        <View style={styles.statsGrid}>
          <ScaleIn delay={150}>
            <View
              style={[
                styles.statCardWrapper,
                { backgroundColor: themeColors.card },
                themeShadows.md,
              ]}
            >
              <StatsCard
                title="Ganancia Hoy"
                value={formatCurrency(summary.todayProfit)}
                icon={
                  <Ionicons
                    name="trending-up"
                    size={20}
                    color={themeColors.primary[500]}
                  />
                }
                color={themeColors.primary[500]}
                trend={
                  summary.todayProfit > 0
                    ? "up"
                    : summary.todayProfit < 0
                      ? "down"
                      : "neutral"
                }
                style={styles.statCard}
              />
            </View>
          </ScaleIn>
          <ScaleIn delay={200}>
            <View
              style={[
                styles.statCardWrapper,
                { backgroundColor: themeColors.card },
                themeShadows.md,
              ]}
            >
              <StatsCard
                title="Transacciones"
                value={summary.todayTransactions.toString()}
                icon={
                  <Ionicons
                    name="swap-horizontal"
                    size={20}
                    color={themeColors.secondary[500]}
                  />
                }
                color={themeColors.secondary[500]}
                subtitle={`${summary.transactionSummary.comprasCount} compras, ${summary.transactionSummary.ventasCount} ventas`}
                style={styles.statCard}
              />
            </View>
          </ScaleIn>
        </View>

        <View style={styles.statsGrid}>
          <ScaleIn delay={250}>
            <View
              style={[
                styles.statCardWrapper,
                { backgroundColor: themeColors.card },
                themeShadows.md,
              ]}
            >
              <StatsCard
                title="Gastos Hoy"
                value={formatCurrency(summary.todayExpenses)}
                icon={
                  <Ionicons
                    name="wallet-outline"
                    size={20}
                    color={themeColors.danger}
                  />
                }
                color={themeColors.danger}
                style={styles.statCard}
              />
            </View>
          </ScaleIn>
          <ScaleIn delay={300}>
            <View
              style={[
                styles.statCardWrapper,
                { backgroundColor: themeColors.card },
                themeShadows.md,
              ]}
            >
              <StatsCard
                title="Balance Caja"
                value={formatCurrency(summary.totalCashBalance)}
                icon={
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={themeColors.accent[500]}
                  />
                }
                color={themeColors.accent[500]}
                style={styles.statCard}
              />
            </View>
          </ScaleIn>
        </View>

        <FadeInDown delay={350}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.text.primary },
                ]}
              >
                Balances por Moneda
              </Text>
              <TouchableOpacity>
                <Text
                  style={[styles.seeAll, { color: themeColors.primary[500] }]}
                >
                  Ver todo
                </Text>
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
                    <TouchableOpacity
                      style={[
                        styles.currencyCard,
                        {
                          borderLeftColor: currencyColor.primary,
                          backgroundColor: themeColors.card,
                        },
                        themeShadows.sm,
                      ]}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.currencyIcon,
                          { backgroundColor: currencyColor.bg },
                        ]}
                      >
                        <Text style={styles.currencySymbol}>
                          {balance.currency.symbol}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.currencyCode,
                          { color: themeColors.text.secondary },
                        ]}
                      >
                        {balance.currency.code}
                      </Text>
                      <Text
                        style={[
                          styles.currencyBalance,
                          { color: themeColors.text.primary },
                        ]}
                      >
                        {balance.balance.toLocaleString("es-CU", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </TouchableOpacity>
                  </ScaleIn>
                );
              })}
            </ScrollView>
          </View>
        </FadeInDown>

        <FadeInDown delay={450}>
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: themeColors.text.primary }]}
            >
              Tasas de Cambio
            </Text>
            <View
              style={[
                styles.ratesContainer,
                { backgroundColor: themeColors.card },
                themeShadows.sm,
              ]}
            >
              {exchangeRates?.map((rate, index) => {
                const currencyColor = getCurrencyColor(rate.currency.code);
                return (
                  <View
                    key={rate.id}
                    style={[
                      styles.rateRow,
                      index < exchangeRates.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: themeColors.border,
                      },
                    ]}
                  >
                    <View style={styles.rateCurrencyInfo}>
                      <View
                        style={[
                          styles.rateCurrencyIcon,
                          { backgroundColor: currencyColor.bg },
                        ]}
                      >
                        <Text style={styles.rateCurrencySymbol}>
                          {rate.currency.symbol}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.rateCurrencyName,
                          { color: themeColors.text.primary },
                        ]}
                      >
                        {rate.currency.name}
                      </Text>
                    </View>
                    <View style={styles.rateValues}>
                      <View style={styles.rateValueContainer}>
                        <Text
                          style={[
                            styles.rateLabel,
                            { color: themeColors.text.tertiary },
                          ]}
                        >
                          Compra
                        </Text>
                        <Text
                          style={[
                            styles.rateValue,
                            { color: themeColors.financial.compra },
                          ]}
                        >
                          {rate.buyRate.toFixed(2)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.rateDivider,
                          { backgroundColor: themeColors.border },
                        ]}
                      />
                      <View style={styles.rateValueContainer}>
                        <Text
                          style={[
                            styles.rateLabel,
                            { color: themeColors.text.tertiary },
                          ]}
                        >
                          Venta
                        </Text>
                        <Text
                          style={[
                            styles.rateValue,
                            { color: themeColors.financial.venta },
                          ]}
                        >
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
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.text.primary },
                ]}
              >
                Resumen de Actividad
              </Text>
              <TouchableOpacity>
                <Text
                  style={[styles.seeAll, { color: themeColors.primary[500] }]}
                >
                  Ver todo
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.chartCard,
                { backgroundColor: themeColors.card },
                themeShadows.sm,
              ]}
            >
              <View style={styles.chartHeader}>
                <Text
                  style={[
                    styles.chartTitle,
                    { color: themeColors.text.primary },
                  ]}
                >
                  Compras vs Ventas
                </Text>
                <Text
                  style={[
                    styles.chartSubtitle,
                    { color: themeColors.text.secondary },
                  ]}
                >
                  Transacciones del día
                </Text>
              </View>
              <BarChart
                data={transactionChartData}
                height={100}
                showLabels
                showValues
                maxValue={Math.max(
                  summary.transactionSummary.comprasCount,
                  summary.transactionSummary.ventasCount,
                  5,
                )}
              />
            </View>
          </View>
        </FadeInDown>

        {activeObjectives && activeObjectives.length > 0 && (
          <FadeInDown delay={600}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.text.primary },
                  ]}
                >
                  Objetivos
                </Text>
                <TouchableOpacity>
                  <Text
                    style={[styles.seeAll, { color: themeColors.primary[500] }]}
                  >
                    Ver todo
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {activeObjectives.slice(0, 3).map((objective, index) => (
                  <ScaleIn key={objective.id} delay={650 + index * 50}>
                    <View
                      style={[
                        styles.objectiveCard,
                        { backgroundColor: themeColors.card },
                        themeShadows.sm,
                      ]}
                    >
                      <View style={styles.objectiveHeader}>
                        <CircularProgress
                          percentage={objective.percentage}
                          size={60}
                          strokeWidth={6}
                          color={
                            objective.percentage >= 100
                              ? themeColors.success
                              : themeColors.primary[500]
                          }
                        >
                          <Text
                            style={[
                              styles.objectivePercentage,
                              { color: themeColors.text.primary },
                            ]}
                          >
                            {objective.percentage.toFixed(0)}%
                          </Text>
                        </CircularProgress>
                      </View>
                      <Text
                        style={[
                          styles.objectiveName,
                          { color: themeColors.text.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {objective.name}
                      </Text>
                      <Text
                        style={[
                          styles.objectiveAmount,
                          { color: themeColors.text.secondary },
                        ]}
                      >
                        {formatCurrency(
                          objective.currentAmount,
                          objective.currency.symbol,
                        )}{" "}
                        /{" "}
                        {formatCurrency(
                          objective.targetAmount,
                          objective.currency.symbol,
                        )}
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
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.text.primary },
                ]}
              >
                Actividad Reciente
              </Text>
              <TouchableOpacity>
                <Text
                  style={[styles.seeAll, { color: themeColors.primary[500] }]}
                >
                  Ver todo
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.transactionsContainer,
                { backgroundColor: themeColors.card },
                themeShadows.sm,
              ]}
            >
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((tx, index) => (
                  <FadeInDown key={tx.id} delay={750 + index * 50}>
                    <TouchableOpacity
                      style={styles.transactionItem}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor:
                              tx.type === "COMPRA"
                                ? themeColors.financial.compraLight
                                : themeColors.financial.ventaLight,
                          },
                        ]}
                      >
                        <Ionicons
                          name={getTransactionIconName(tx.type)}
                          size={22}
                          color={
                            tx.type === "COMPRA"
                              ? themeColors.financial.compra
                              : themeColors.financial.venta
                          }
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text
                          style={[
                            styles.transactionName,
                            { color: themeColors.text.primary },
                          ]}
                        >
                          {tx.type === "COMPRA" ? "Compra" : "Venta"} de{" "}
                          {tx.currency.code}
                        </Text>
                        <View style={styles.transactionMeta}>
                          <Text
                            style={[
                              styles.transactionAmount,
                              { color: themeColors.text.secondary },
                            ]}
                          >
                            {tx.amount.toLocaleString()} {tx.currency.code}
                          </Text>
                          <Text
                            style={[
                              styles.transactionDot,
                              { color: themeColors.text.tertiary },
                            ]}
                          >
                            •
                          </Text>
                          <Text
                            style={[
                              styles.transactionRate,
                              { color: themeColors.text.tertiary },
                            ]}
                          >
                            @ {tx.rate}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text
                          style={[
                            styles.transactionTotal,
                            {
                              color:
                                tx.type === "COMPRA"
                                  ? themeColors.financial.compra
                                  : themeColors.financial.venta,
                            },
                          ]}
                        >
                          {tx.type === "COMPRA" ? "-" : "+"}
                          {formatCurrency(tx.totalCup)}
                        </Text>
                        <Text
                          style={[
                            styles.transactionTime,
                            { color: themeColors.text.tertiary },
                          ]}
                        >
                          {formatTime(tx.createdAt)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </FadeInDown>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="receipt-outline"
                    size={48}
                    color={themeColors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: themeColors.text.secondary },
                    ]}
                  >
                    No hay transacciones recientes
                  </Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: floatingTabBarMetrics.contentBottomPadding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCardWrapper: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  statCard: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  horizontalScroll: {
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  currencyCard: {
    width: 130,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  currencyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  currencyCode: {
    fontSize: 13,
    marginBottom: 4,
  },
  currencyBalance: {
    fontSize: 18,
    fontWeight: "700",
  },
  ratesContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
  },
  rateCurrencyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rateCurrencyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  rateCurrencySymbol: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  rateCurrencyName: {
    fontSize: 14,
    fontWeight: "500",
  },
  rateValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rateValueContainer: {
    alignItems: "center",
  },
  rateLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  rateDivider: {
    width: 1,
    height: 24,
  },
  chartCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  chartHeader: {
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 12,
  },
  objectiveCard: {
    width: 160,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  objectiveHeader: {
    marginBottom: spacing.sm,
  },
  objectivePercentage: {
    fontSize: 14,
    fontWeight: "700",
  },
  objectiveName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  objectiveAmount: {
    fontSize: 12,
    textAlign: "center",
  },
  transactionsContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  transactionAmount: {
    fontSize: 13,
  },
  transactionDot: {
    fontSize: 13,
  },
  transactionRate: {
    fontSize: 13,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionTotal: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
  },
});
