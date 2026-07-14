import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  FadeIn,
  FadeInDown,
  ScaleIn,
  PressableScale,
} from "../../components/animations";
import { BarChart, StatsCard } from "../../components/charts/Charts";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows, useIsDark } from "../../store/themeStore";
import type { CashBalance, Transaction } from "../../types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useCashBalancesQuery,
  useCashTransactionsQuery,
  useCreateCashAdjustmentMutation,
  useCreateCashAuditMutation,
} from "../../modules/cash/application/useCash";
import { useTabBarScrollBehavior, useTabScrollToTop } from "../../navigation/TabBarMotionProvider";
import { floatingTabBarMetrics } from "../../navigation/fintechTabBar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const CashScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const isDark = useIsDark();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabBarScrollBehavior = useTabBarScrollBehavior();
  const cashScrollRef = useRef<ScrollView>(null);
  const scrollToTop = useCallback(() => {
    cashScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);
  useTabScrollToTop("Cash", scrollToTop);

  const cashBalancesQuery = useCashBalancesQuery();
  const cashTransactionsQuery = useCashTransactionsQuery();
  const createCashAuditMutation = useCreateCashAuditMutation();
  const createCashAdjustmentMutation = useCreateCashAdjustmentMutation();

  const cashBalances = cashBalancesQuery.data ?? [];
  const transactions = cashTransactionsQuery.data ?? [];

  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"INGRESO" | "EGRESO">(
    "INGRESO",
  );

  useEffect(() => {
    if (!selectedCurrency && cashBalances.length > 0) {
      setSelectedCurrency(cashBalances[0].currencyId);
    }
  }, [cashBalances, selectedCurrency]);

  const handleRefresh = async () => {
    await Promise.all([
      cashBalancesQuery.refetch(),
      cashTransactionsQuery.refetch(),
    ]);
  };

  const resetForms = () => {
    setAmount("");
    setNotes("");
    setReason("");
    setAdjustmentType("INGRESO");
    setAuditModalVisible(false);
    setAdjustmentModalVisible(false);
  };

  const handleCreateAudit = async () => {
    if (!selectedCurrency || !amount) {
      Alert.alert("Error", "Complete todos los campos");
      return;
    }

    try {
      await createCashAuditMutation.mutateAsync({
        currencyId: selectedCurrency,
        actualBalance: parseFloat(amount),
        notes,
      });
      Alert.alert("Éxito", "Arqueo registrado correctamente");
      resetForms();
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar el arqueo");
    }
  };

  const handleCreateAdjustment = async () => {
    if (!selectedCurrency || !amount || !reason) {
      Alert.alert("Error", "Complete todos los campos");

      return;
    }

    try {
      await createCashAdjustmentMutation.mutateAsync({
        currencyId: selectedCurrency,
        amount: parseFloat(amount),
        type: adjustmentType,
        reason,
      });
      Alert.alert("Éxito", "Ajuste registrado correctamente");
      resetForms();
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar el ajuste");
    }
  };

  const formatNumber = (value: number | string) => {
    const num = Number(value) || 0;
    return num.toLocaleString("es-CU", { minimumFractionDigits: 2 });
  };

  const getCurrencyColor = (code: string) => {
    const colorMap: Record<string, string> = {
      USD: themeColors.currencies.usd.primary,
      EUR: themeColors.currencies.eur.primary,
      MLC: themeColors.currencies.mlc.primary,
      CUP: themeColors.currencies.cup.primary,
    };
    return colorMap[code] || themeColors.primary[500];
  };

  const getCurrencyBgColor = (code: string) => {
    const colorMap: Record<string, string> = {
      USD: themeColors.currencies.usd.bg,
      EUR: themeColors.currencies.eur.bg,
      MLC: themeColors.currencies.mlc.bg,
      CUP: themeColors.currencies.cup.bg,
    };
    return colorMap[code] || themeColors.primary[50];
  };

  const quickActions = [
    {
      id: "audit",
      title: "Arqueo de Caja",
      subtitle: "Verificar saldo real",
      icon: "checkmark-done" as const,
      color: themeColors.primary[500],
    },
    {
      id: "adjustment",
      title: "Ajuste Manual",
      subtitle: "Ingreso o egreso",
      icon: "settings-outline" as const,
      color: themeColors.warning,
    },
    {
      id: "history",
      title: "Historial",
      subtitle: "Movimientos de caja",
      icon: "time-outline" as const,
      color: themeColors.success,
    },
  ];

  const totalBalances = cashBalances.reduce((acc, b) => {
    return acc + Number(b.balance);
  }, 0);

  const chartData = cashBalances.slice(0, 4).map((b) => ({
    label: b.currency?.code || "",
    value: Math.abs(Number(b.balance)),
    color: getCurrencyColor(b.currency?.code || ""),
  }));

  const renderCurrencySelector = () => (
    <View style={styles.currencySelector}>
      <Text style={[styles.label, { color: themeColors.text.primary }]}>
        Moneda
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {cashBalances.map((balance) => (
          <TouchableOpacity
            key={balance.currencyId}
            style={[
              styles.currencyOption,
              selectedCurrency === balance.currencyId && {
                borderColor: themeColors.primary[500],
                backgroundColor: isDark
                  ? "rgba(99, 102, 241, 0.2)"
                  : themeColors.primary[50],
              },
            ]}
            onPress={() => setSelectedCurrency(balance.currencyId)}
          >
            <Text
              style={[
                styles.currencyOptionText,
                selectedCurrency === balance.currencyId && {
                  color: themeColors.primary[500],
                },
              ]}
            >
              {balance.currency.code}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView
        ref={cashScrollRef}
        {...tabBarScrollBehavior}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={
              cashBalancesQuery.isRefetching ||
              cashTransactionsQuery.isRefetching
            }
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
      >
        <FadeIn>
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              Caja
            </Text>
            <Text
              style={[styles.subtitle, { color: themeColors.text.secondary }]}
            >
              Saldos y control de efectivo
            </Text>
          </View>
        </FadeIn>

        <View style={styles.statsRow}>
          <ScaleIn delay={100}>
            <View
              style={[
                styles.statCardWrapper,
                { backgroundColor: themeColors.card },
                themeShadows.md,
              ]}
            >
              <StatsCard
                title="Total en Caja"
                value={`$ ${formatNumber(totalBalances)}`}
                icon={
                  <Ionicons
                    name="wallet"
                    size={20}
                    color={themeColors.primary[500]}
                  />
                }
                color={themeColors.primary[500]}
                style={styles.statCard}
              />
            </View>
          </ScaleIn>
          <ScaleIn delay={150}>
            <View
              style={[
                styles.statCardWrapper,
                { backgroundColor: themeColors.card },
                themeShadows.md,
              ]}
            >
              <StatsCard
                title="Monedas"
                value={cashBalances.length.toString()}
                subtitle="Activas"
                icon={
                  <Ionicons name="cash" size={20} color={themeColors.success} />
                }
                color={themeColors.success}
                style={styles.statCard}
              />
            </View>
          </ScaleIn>
        </View>

        <FadeInDown delay={200}>
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: themeColors.text.primary }]}
            >
              Saldos por Moneda
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.balancesScroll}
            >
              {cashBalances.map((balance, index) => {
                const currencyColor = getCurrencyColor(
                  balance.currency?.code || "",
                );
                const bgColor = getCurrencyBgColor(
                  balance.currency?.code || "",
                );

                return (
                  <ScaleIn key={balance.id} delay={250 + index * 50}>
                    <TouchableOpacity
                      style={[
                        styles.balanceCard,
                        {
                          borderLeftColor: currencyColor,
                          backgroundColor: themeColors.card,
                        },
                        themeShadows.sm,
                      ]}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.balanceIcon,
                          { backgroundColor: bgColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.balanceSymbol,
                            { color: currencyColor },
                          ]}
                        >
                          {balance.currency?.symbol}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.balanceCode,
                          { color: themeColors.text.primary },
                        ]}
                      >
                        {balance.currency?.code}
                      </Text>
                      <Text
                        style={[
                          styles.balanceName,
                          { color: themeColors.text.secondary },
                        ]}
                      >
                        {balance.currency?.name}
                      </Text>
                      <Text
                        style={[styles.balanceAmount, { color: currencyColor }]}
                      >
                        {formatNumber(balance.balance)}
                      </Text>
                    </TouchableOpacity>
                  </ScaleIn>
                );
              })}
            </ScrollView>
          </View>
        </FadeInDown>

        {chartData.length > 0 && (
          <FadeInDown delay={300}>
            <View
              style={[
                styles.section,
                { backgroundColor: themeColors.card },
                themeShadows.md,
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.text.primary },
                ]}
              >
                Distribución
              </Text>
              <View style={styles.chartCard}>
                <BarChart
                  data={chartData}
                  height={100}
                  showLabels
                  showValues
                  maxValue={Math.max(...chartData.map((d) => d.value), 100)}
                />
              </View>
            </View>
          </FadeInDown>
        )}

        <FadeInDown delay={350}>
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: themeColors.text.primary }]}
            >
              Acciones Rápidas
            </Text>
            {quickActions.map((action, index) => (
              <ScaleIn key={action.id} delay={400 + index * 50}>
                <PressableScale
                  onPress={
                    action.id === "history"
                      ? () => navigation.navigate("CashHistory")
                      : () => {
                          if (action.id === "audit") setAuditModalVisible(true);
                          if (action.id === "adjustment")
                            setAdjustmentModalVisible(true);
                        }
                  }
                  style={styles.actionCardWrapper}
                >
                  <View
                    style={[
                      styles.actionCard,
                      { backgroundColor: themeColors.card },
                      themeShadows.sm,
                    ]}
                  >
                    <View
                      style={[
                        styles.actionIcon,
                        { backgroundColor: `${action.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={action.icon}
                        size={22}
                        color={action.color}
                      />
                    </View>
                    <View style={styles.actionInfo}>
                      <Text
                        style={[
                          styles.actionTitle,
                          { color: themeColors.text.primary },
                        ]}
                      >
                        {action.title}
                      </Text>
                      <Text
                        style={[
                          styles.actionSubtitle,
                          { color: themeColors.text.secondary },
                        ]}
                      >
                        {action.subtitle}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={themeColors.text.tertiary}
                    />
                  </View>
                </PressableScale>
              </ScaleIn>
            ))}
          </View>
        </FadeInDown>

        {transactions.length > 0 && (
          <FadeInDown delay={450}>
            <View
              style={[
                styles.section,
                { backgroundColor: themeColors.card },
                themeShadows.md,
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.text.primary },
                  ]}
                >
                  Últimas Transacciones
                </Text>
                <TouchableOpacity>
                  <Text
                    style={[styles.seeAll, { color: themeColors.primary[500] }]}
                  >
                    Ver todo
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.transactionsCard}>
                {transactions.slice(0, 4).map((tx, index) => {
                  const isCompra = tx.type === "COMPRA";
                  return (
                    <View
                      key={tx.id}
                      style={[
                        styles.transactionItem,
                        index < transactions.slice(0, 4).length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: themeColors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor: isCompra
                              ? themeColors.financial.compraLight
                              : themeColors.financial.ventaLight,
                          },
                        ]}
                      >
                        <Ionicons
                          name={isCompra ? "arrow-down" : "arrow-up"}
                          size={16}
                          color={
                            isCompra
                              ? themeColors.financial.compra
                              : themeColors.financial.venta
                          }
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text
                          style={[
                            styles.transactionTitle,
                            { color: themeColors.text.primary },
                          ]}
                        >
                          {isCompra ? "Compra" : "Venta"} {tx.currency?.code}
                        </Text>
                        <Text
                          style={[
                            styles.transactionDate,
                            { color: themeColors.text.secondary },
                          ]}
                        >
                          {format(new Date(tx.createdAt), "dd/MM HH:mm")}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionAmount,
                          {
                            color: isCompra
                              ? themeColors.financial.compra
                              : themeColors.financial.venta,
                          },
                        ]}
                      >
                        {isCompra ? "-" : "+"}
                        {formatNumber(tx.totalCup)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </FadeInDown>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Audit Modal */}
      <Modal
        visible={auditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAuditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setAuditModalVisible(false)}
          />
          <View
            style={[styles.modalContent, { backgroundColor: themeColors.card }]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: themeColors.text.primary }]}
              >
                Registrar Arqueo
              </Text>
              <TouchableOpacity onPress={() => setAuditModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={themeColors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {renderCurrencySelector()}

            <Input
              label="Saldo Real en Caja"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <Input
              label="Notas (Opcional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Observaciones..."
              multiline
              numberOfLines={3}
            />

            <Button
              title={
                createCashAuditMutation.isPending
                  ? "Guardando..."
                  : "Guardar Arqueo"
              }
              onPress={handleCreateAudit}
              loading={createCashAuditMutation.isPending}
              style={styles.submitButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Adjustment Modal */}
      <Modal
        visible={adjustmentModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAdjustmentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setAdjustmentModalVisible(false)}
          />
          <View
            style={[styles.modalContent, { backgroundColor: themeColors.card }]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: themeColors.text.primary }]}
              >
                Ajuste Manual
              </Text>
              <TouchableOpacity
                onPress={() => setAdjustmentModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={themeColors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {renderCurrencySelector()}

            <Text style={[styles.label, { color: themeColors.text.primary }]}>
              Tipo de Ajuste
            </Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  adjustmentType === "INGRESO" && {
                    backgroundColor: themeColors.success,
                  },
                ]}
                onPress={() => setAdjustmentType("INGRESO")}
              >
                <Ionicons
                  name="add-circle"
                  size={20}
                  color={
                    adjustmentType === "INGRESO" ? "#fff" : themeColors.success
                  }
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    adjustmentType === "INGRESO" && styles.typeButtonTextActive,
                  ]}
                >
                  Ingreso
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  adjustmentType === "EGRESO" && {
                    backgroundColor: themeColors.danger,
                  },
                ]}
                onPress={() => setAdjustmentType("EGRESO")}
              >
                <Ionicons
                  name="remove-circle"
                  size={20}
                  color={
                    adjustmentType === "EGRESO" ? "#fff" : themeColors.danger
                  }
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    adjustmentType === "EGRESO" && styles.typeButtonTextActive,
                  ]}
                >
                  Egreso
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Monto"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <Input
              label="Motivo"
              value={reason}
              onChangeText={setReason}
              placeholder="Razón del ajuste..."
            />

            <Button
              title={
                createCashAdjustmentMutation.isPending
                  ? "Guardando..."
                  : "Guardar Ajuste"
              }
              onPress={handleCreateAdjustment}
              loading={createCashAdjustmentMutation.isPending}
              style={styles.submitButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: floatingTabBarMetrics.contentBottomPadding,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  balancesScroll: {
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  balanceCard: {
    width: 140,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  balanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  balanceSymbol: {
    fontSize: 16,
    fontWeight: "700",
  },
  balanceCode: {
    fontSize: 14,
    fontWeight: "600",
  },
  balanceName: {
    fontSize: 11,
    marginTop: 2,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  chartCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  actionCardWrapper: {
    marginBottom: spacing.sm,
  },
  actionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  actionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 11,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  currencySelector: {
    marginBottom: spacing.md,
  },
  currencyOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: spacing.sm,
    backgroundColor: "#F1F5F9",
  },
  currencyOptionText: {
    fontWeight: "600",
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: "#F1F5F9",
    gap: spacing.xs,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
