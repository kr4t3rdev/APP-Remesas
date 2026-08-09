import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Alert } from "../../../utils/alert";
import { Button } from "../../../components/ui/Button";
import { useColors } from "../../../store/themeStore";
import { floatingTabBarMetrics } from "../../../navigation/fintechTabBar";
import {
  useCashOverviewQuery,
  useCreateCashAdjustmentMutation,
  useCreateCashAuditMutation,
} from "../../../modules/cash/application/useCash";
import {
  useCurrenciesQuery,
  useCurrenciesWithPrimaryQuery,
} from "../../../modules/currencies/application/useCurrencies";
import { CashAuditCard } from "../components/CashAuditCard";
import { CashMovementCard } from "../components/CashMovementCard";
import { CashAdjustmentSheet } from "../../../components/business/modals/CashAdjustmentSheet";

type CashAction = "AUDIT" | "ADJUSTMENT" | null;

export const CashRegisterTab = () => {
  const colors = useColors();
  const navigation = useNavigation();
  const overviewQuery = useCashOverviewQuery();
  const currenciesListQuery = useCurrenciesQuery();
  const currenciesQuery = useCurrenciesWithPrimaryQuery();
  const createAuditMutation = useCreateCashAuditMutation();
  const createAdjustmentMutation = useCreateCashAdjustmentMutation();
  const overview = overviewQuery.data;
  const balances = overview?.balances ?? [];
  const availableCurrencies = (
    currenciesListQuery.data ??
    currenciesQuery.data?.currencies ??
    overview?.currencies ??
    []
  ).filter((currency) => currency.isActive !== false);
  const primaryCurrencyId =
    currenciesQuery.data?.primaryCurrencyId ?? overview?.primaryCurrency?.id;
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<CashAction>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"INGRESO" | "EGRESO">("INGRESO");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (selectedCurrencyId === null && availableCurrencies.length > 0) {
      setSelectedCurrencyId(
        primaryCurrencyId ?? availableCurrencies[0].id,
      );
    }
  }, [availableCurrencies, primaryCurrencyId, selectedCurrencyId]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }, [balances.length]);

  const closeAction = () => {
    setActiveAction(null);
    setAmount("");
    setNotes("");
    setReason("");
    setAdjustmentType("INGRESO");
  };

  const handleAudit = async () => {
    const parsedAmount = Number(amount);
    if (!selectedCurrencyId || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      Alert.alert("Error", "Ingresa un saldo real válido");
      return;
    }

    try {
      await createAuditMutation.mutateAsync({
        currencyId: selectedCurrencyId,
        actualBalance: parsedAmount,
        notes: notes.trim() || undefined,
      });
      Alert.alert("Éxito", "Arqueo registrado correctamente");
      closeAction();
    } catch {
      Alert.alert("Error", "No se pudo registrar el arqueo");
    }
  };

  const handleAdjustment = async () => {
    const parsedAmount = Number(amount);
    if (
      !selectedCurrencyId ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !reason.trim()
    ) {
      Alert.alert("Error", "Completa el monto y el motivo del ajuste");
      return;
    }

    try {
      await createAdjustmentMutation.mutateAsync({
        currencyId: selectedCurrencyId,
        amount: parsedAmount,
        type: adjustmentType,
        reason: reason.trim(),
      });
      Alert.alert("Éxito", "Ajuste registrado correctamente");
      closeAction();
    } catch {
      Alert.alert("Error", "No se pudo registrar el ajuste");
    }
  };

  const formatAmount = (value: number, symbol: string) =>
    `${symbol} ${value.toLocaleString("es-CU", { minimumFractionDigits: 2 })}`;

  if (overviewQuery.isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={overviewQuery.isRefetching}
            onRefresh={() => overviewQuery.refetch()}
            tintColor={colors.primary[500]}
          />
        }
      >
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Caja</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Saldos y control de efectivo por moneda
          </Text>
        </View>

        {overviewQuery.isError ? (
          <View style={[styles.stateCard, { backgroundColor: colors.card }]}>
            <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
            <Text style={[styles.stateTitle, { color: colors.text.primary }]}>No se pudo cargar Caja</Text>
            <Text style={[styles.stateText, { color: colors.text.secondary }]}>Revisa tu conexión e intenta nuevamente.</Text>
            <Button title="Reintentar" onPress={() => overviewQuery.refetch()} size="sm" />
          </View>
        ) : (
          <>
            {balances.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Saldos por moneda</Text>
                <View style={styles.balanceGrid}>
                  {balances.map((balance) => (
                    <View key={balance.currencyId} style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                      <View style={[styles.currencyIcon, { backgroundColor: colors.primary[50] }]}> 
                        <Text style={[styles.currencyCode, { color: colors.primary[700] }]}>{balance.currency.code}</Text>
                      </View>
                      <Text style={[styles.balanceLabel, { color: colors.text.secondary }]}>{balance.currency.name}</Text>
                      <Text style={[styles.balanceValue, { color: colors.text.primary }]}>
                        {formatAmount(balance.balance, balance.currency.symbol)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={[styles.stateCard, { backgroundColor: colors.card }]}> 
                <Ionicons name="wallet-outline" size={28} color={colors.text.tertiary} />
                <Text style={[styles.stateTitle, { color: colors.text.primary }]}>Caja sin saldos</Text>
                <Text style={[styles.stateText, { color: colors.text.secondary }]}>Registra un ajuste inicial para comenzar a operar.</Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Acciones</Text>
            <View style={styles.actionsRow}>
              <Button title="Registrar ajuste" onPress={() => setActiveAction("ADJUSTMENT")} variant="secondary" style={styles.actionButton} />
              <Button title="Registrar arqueo" onPress={() => setActiveAction("AUDIT")} style={styles.actionButton} />
            </View>

            {overview?.recentMovements.length ? <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Movimientos recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate("CashHistory" as never)}>
                <Text style={[styles.link, { color: colors.primary[600] }]}>Ver historial</Text>
              </TouchableOpacity>
            </View> : null}

            {overview?.recentMovements.length ? (
              overview.recentMovements.map((movement) => (
                <CashMovementCard
                  key={movement.id}
                  movement={{
                    id: movement.id,
                    title: movement.title,
                    subtitle: `${movement.description} · ${format(new Date(movement.createdAt), "d MMM, HH:mm", { locale: es })}`,
                    amount: movement.totalBase ?? movement.amount,
                    type: movement.direction === "IN" ? "INCOME" : "EXPENSE",
                    badgeLabel: movement.currency.code,
                    currencySymbol: movement.totalBase !== null
                      ? overview.primaryCurrency?.symbol
                      : movement.currency.symbol,
                  }}
                />
              ))
            ) : balances.length > 0 ? (
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No hay movimientos recientes.</Text>
            ) : null}

            {overview?.latestAudits.length ? (
              <>
                <Text style={[styles.sectionTitle, styles.auditTitle, { color: colors.text.primary }]}>Último arqueo</Text>
                {overview.latestAudits.map((audit) => (
                  <CashAuditCard
                    key={audit.id}
                    audit={{
                      dateFormatted: format(new Date(audit.createdAt), "d MMM, yyyy · HH:mm", { locale: es }),
                      expected: audit.expectedBalance,
                      actual: audit.actualBalance,
                      status: audit.difference === 0 ? "MATCHED" : audit.difference < 0 ? "SHORTAGE" : "OVERAGE",
                      auditorName: "Usuario actual",
                    }}
                  />
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <CashAdjustmentSheet
        visible={activeAction !== null}
        action={activeAction ?? "ADJUSTMENT"}
        currencies={availableCurrencies}
        selectedCurrencyId={selectedCurrencyId}
        onSelectCurrency={setSelectedCurrencyId}
        amount={amount}
        onChangeAmount={setAmount}
        notes={notes}
        onChangeNotes={setNotes}
        reason={reason}
        onChangeReason={setReason}
        adjustmentType={adjustmentType}
        onChangeAdjustmentType={setAdjustmentType}
        isSaving={createAuditMutation.isPending || createAdjustmentMutation.isPending}
        onSave={activeAction === "AUDIT" ? handleAudit : handleAdjustment}
        onClose={closeAction}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: floatingTabBarMetrics.contentBottomPadding },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerSection: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  balanceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  balanceCard: { width: "48%", minHeight: 126, borderWidth: 1, borderRadius: 14, padding: 14 },
  currencyIcon: { alignItems: "center", justifyContent: "center", width: 42, height: 28, borderRadius: 8, marginBottom: 10 },
  currencyCode: { fontSize: 12, fontWeight: "800" },
  balanceLabel: { fontSize: 12, marginBottom: 4 },
  balanceValue: { fontSize: 18, fontWeight: "800" },
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  actionButton: { flex: 1 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  link: { fontSize: 14, fontWeight: "700" },
  emptyText: { marginBottom: 20 },
  auditTitle: { marginTop: 20 },
  stateCard: { alignItems: "center", borderRadius: 14, padding: 24, gap: 8 },
  stateTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  stateText: { fontSize: 14, textAlign: "center", marginBottom: 8 },
});
