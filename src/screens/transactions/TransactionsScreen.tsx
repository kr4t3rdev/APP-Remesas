import React, { useCallback, useRef, useState } from "react";

import {
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { FadeIn, FadeInDown, ScaleIn } from "../../components/animations";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type { Transaction } from "../../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useTransactionsQuery,
} from "../../modules/transactions/application/useTransactions";
import {
  TransactionFilterModal,
  getTransactionFilterLabel,
  type TransactionFilterValue,
} from "./TransactionFilterModal";
import CountryFlag from "react-native-country-flag";
import { getCountryCode } from "../../utils/currencyUtils";
import { floatingTabBarMetrics } from "../../navigation/fintechTabBar";
import { useTabBarScrollBehavior, useTabScrollToTop } from "../../navigation/TabBarMotionProvider";
import { TransactionModal } from "../../components/business/modals/TransactionModal";
import { getTransactionsHeaderLayout } from "./transactionsHeaderLayout";
import type { RootStackParamList } from "../../navigation/types";

export const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const themeColors = useColors();
  const themeShadows = useShadows();
  const tabBarScrollBehavior = useTabBarScrollBehavior();
  const { width, fontScale } = useWindowDimensions();
  const headerLayout = getTransactionsHeaderLayout(width, fontScale);
  const transactionsListRef = useRef<FlatList<Transaction>>(null);
  const scrollToTop = useCallback(() => {
    transactionsListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);
  useTabScrollToTop("Transactions", scrollToTop);

  const [filter, setFilter] = useState<TransactionFilterValue>("all");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const transactionsQuery = useTransactionsQuery(
    filter === "REMITTANCE"
      ? { operationKind: "REMITTANCE" }
      : filter === "COMPRA" || filter === "VENTA"
        ? { type: filter, operationKind: "TRANSFER" }
        : undefined,
  );

  const transactions = transactionsQuery.data ?? [];

  const handleRefresh = async () => {
    try {
      await transactionsQuery.refetch();
    } catch {
      Alert.alert("Error", "No se pudieron cargar las transacciones");
    }
  };

  const formatCurrency = (amount: number | string, symbol: string) => {
    const numAmount = Number(amount) || 0;
    return `${symbol} ${numAmount.toLocaleString("es-CU", { minimumFractionDigits: 2 })}`;
  };

  const formatRate = (rate: number | string) => {
    const numRate = Number(rate) || 0;
    return numRate.toFixed(2);
  };

  const formatTotalCup = (total: number | string) => {
    const numTotal = Number(total) || 0;
    return numTotal.toLocaleString("es-CU", { minimumFractionDigits: 2 });
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
    return format(date, "dd/MM/yyyy", { locale: es });
  };

  const renderTransaction = ({
    item,
    index,
  }: {
    item: Transaction;
    index: number;
  }) => {
    const isCompra = item.type === "COMPRA";

    return (
      <FadeInDown delay={index * 30}>
        <TouchableOpacity
          style={[
            styles.transactionCard,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
            themeShadows.md,
          ]}
          activeOpacity={0.85}
        >
          <View style={styles.transactionHeader}>
            <View
              style={[
                styles.transactionIcon,
                {
                  backgroundColor: isCompra
                    ? themeColors.financial.compraLight
                    : themeColors.financial.ventaLight,
                  borderColor: isCompra
                    ? themeColors.financial.compra
                    : themeColors.financial.venta,
                },
                themeShadows.sm,
              ]}
            >
              <Ionicons
                name={isCompra ? "arrow-down" : "arrow-up"}
                size={20}
                color={
                  isCompra
                    ? themeColors.financial.compra
                    : themeColors.financial.venta
                }
              />
            </View>
            <View style={styles.transactionInfo}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                {item.currency?.code && getCountryCode(item.currency.code) ? (
                  <CountryFlag
                    isoCode={getCountryCode(item.currency.code)!}
                    size={14}
                    style={{ borderRadius: 2 }}
                  />
                ) : null}
                <Text
                  style={[
                    styles.transactionTitle,
                    { color: themeColors.text.primary },
                  ]}
                >
                  {isCompra ? "Compra" : "Venta"} de {item.currency?.code}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionDate,
                  { color: themeColors.text.secondary },
                ]}
              >
                {formatTime(item.createdAt)}
              </Text>
            </View>
            <View style={styles.transactionAmounts}>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: themeColors.text.primary },
                ]}
              >
                {formatCurrency(item.amount, item.currency?.symbol || "$")}
              </Text>
              <Text
                style={[
                  styles.transactionRate,
                  { color: themeColors.text.secondary },
                ]}
              >
                @ {formatRate(item.rate)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.transactionFooter,
              { borderTopColor: themeColors.border },
            ]}
          >
            <View style={styles.transactionTotal}>
              <Text
                style={[
                  styles.transactionTotalLabel,
                  { color: themeColors.text.tertiary },
                ]}
              >
                Total
              </Text>
              <Text
                style={[
                  styles.transactionTotalValue,
                  {
                    color: isCompra
                      ? themeColors.financial.compra
                      : themeColors.financial.venta,
                  },
                ]}
              >
                {isCompra ? "-" : "+"}$ {formatTotalCup(item.totalCup)} CUP
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </FadeInDown>
    );
  };

  const filterLabel = getTransactionFilterLabel(filter);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <FadeIn>
        <View style={styles.header}>
          <View
            style={[
              styles.headerTopRow,
              headerLayout === "stacked" && styles.headerTopRowStacked,
            ]}
          >
            <View style={styles.headerTitles}>
              <Text
                accessibilityRole="header"
                style={[styles.title, { color: themeColors.text.primary }]}
              >
                Transacciones
              </Text>
              <Text
                style={[styles.subtitle, { color: themeColors.text.secondary }]}
              >
                Compras, ventas y remesas
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate("BusinessWorkers")}
                style={[
                  styles.workersTrigger,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  },
                  themeShadows.md,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Trabajadores"
              >
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={themeColors.primary[500]}
                />
                <Text
                  style={[
                    styles.workersTriggerText,
                    { color: themeColors.text.primary },
                  ]}
                >
                  Trabajadores
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(true)}
                style={[
                  styles.filterTrigger,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  },
                  themeShadows.md,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar transacciones. Filtro actual: ${filterLabel}`}
              >
                <Text
                  style={[
                    styles.filterTriggerText,
                    { color: themeColors.text.primary },
                  ]}
                >
                  {filterLabel}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={themeColors.primary[500]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </FadeIn>

      <TransactionFilterModal
        visible={filterModalVisible}
        value={filter}
        onSelect={(key) => {
          setFilter(key);
          setFilterModalVisible(false);
        }}
        onClose={() => setFilterModalVisible(false)}
      />

      <FlatList
        ref={transactionsListRef}
        {...tabBarScrollBehavior}
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={transactionsQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyStateIconWrap,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
                themeShadows.sm,
              ]}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={40}
                color={themeColors.primary[400]}
              />
            </View>
            <Text
              style={[
                styles.emptyStateText,
                { color: themeColors.text.secondary },
              ]}
            >
              No hay transacciones
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: themeColors.text.tertiary },
              ]}
            >
              Toca el botón + para registrar una nueva
            </Text>
          </View>
        }
      />

      <ScaleIn delay={200}>
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: themeColors.primary[500] },
            themeShadows.glow,
          ]}
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Nueva transacción"
        >
          <Ionicons name="add" size={28} color={themeColors.text.inverse} />
        </TouchableOpacity>
      </ScaleIn>

      <TransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
    opacity: 0.9,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  headerTopRowStacked: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  filterTrigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    minHeight: 44,
  },
  filterTriggerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  workersTrigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    minHeight: 44,
  },
  workersTriggerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 140,
  },
  transactionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmounts: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  transactionRate: {
    fontSize: 12,
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  transactionTotal: {
    flex: 1,
  },
  transactionTotalLabel: {
    fontSize: 11,
  },
  transactionTotalValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: spacing.md,
    fontWeight: "500",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  historyFabWrap: {
    position: "absolute",
    bottom: floatingTabBarMetrics.actionBottom,
    left: spacing.lg,
  },
  historyFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  fab: {
    position: "absolute",
    bottom: floatingTabBarMetrics.actionBottom,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: "90%",
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: "#F1F5F9",
    gap: spacing.md,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  currencyScroll: {
    marginBottom: spacing.lg,
  },
  currencyButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: "#F1F5F9",
    marginRight: spacing.md,
    minWidth: 70,
    borderWidth: 1,
    borderColor: "transparent",
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  currencyCode: {
    fontSize: 12,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  previewCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  previewLabel: {
    fontSize: 14,
  },
  previewOperator: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  submitButton: {
    marginTop: spacing.md,
  },
  validationError: {
    color: "#B91C1C",
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
