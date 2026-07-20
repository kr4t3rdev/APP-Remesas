import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart } from "../../components/charts/Charts";
import { FadeIn, FadeInDown, PressableScale, ScaleIn } from "../../components/animations";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { CashMovementCard } from "../business/components/CashMovementCard";
import { floatingTabBarMetrics } from "../../navigation/fintechTabBar";
import type { RootStackParamList } from "../../navigation/types";
import { useTabBarScrollBehavior, useTabScrollToTop } from "../../navigation/TabBarMotionProvider";
import {
  useCashOverviewQuery,
  useCreateCashAdjustmentMutation,
  useCreateCashAuditMutation,
} from "../../modules/cash/application/useCash";
import {
  useCurrenciesQuery,
  useCurrenciesWithPrimaryQuery,
} from "../../modules/currencies/application/useCurrencies";
import { useCurrentExchangeRatesQuery } from "../../modules/exchange-rates/application/useExchangeRates";
import { useProfileBankAccountsQuery } from "../../modules/profile/application/useProfile";
import { useColors, useIsDark, useShadows } from "../../store/themeStore";
import { Alert } from "../../utils/alert";

type CashAction = "AUDIT" | "ADJUSTMENT" | null;
type AdjustmentType = "INGRESO" | "EGRESO";

export const CashScreen: React.FC = () => {
  const colors = useColors();
  const shadows = useShadows();
  const isDark = useIsDark();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const overviewQuery = useCashOverviewQuery();
  const currenciesListQuery = useCurrenciesQuery();
  const currenciesWithPrimaryQuery = useCurrenciesWithPrimaryQuery();
  const createAuditMutation = useCreateCashAuditMutation();
  const createAdjustmentMutation = useCreateCashAdjustmentMutation();
  const bankAccountsQuery = useProfileBankAccountsQuery();
  const exchangeRatesQuery = useCurrentExchangeRatesQuery();
  const tabBarScrollBehavior = useTabBarScrollBehavior();
  const scrollRef = useRef<ScrollView>(null);
  const overview = overviewQuery.data;
  const balances = overview?.balances ?? [];
  const bankAccounts = bankAccountsQuery.data ?? [];
  const availableCurrencies = [
    currenciesListQuery.data,
    currenciesWithPrimaryQuery.data?.currencies,
    overview?.currencies,
  ].find((currencies) => currencies && currencies.length > 0)?.filter(
    (currency) => currency.isActive !== false,
  ) ?? [];
  const primaryCurrencyId =
    currenciesWithPrimaryQuery.data?.primaryCurrencyId ?? overview?.primaryCurrency?.id;

  const [activeAction, setActiveAction] = useState<CashAction>(null);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("INGRESO");

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);
  useTabScrollToTop("Cash", scrollToTop);

  useEffect(() => {
    if (selectedCurrencyId === null && availableCurrencies.length > 0) {
      setSelectedCurrencyId(primaryCurrencyId ?? availableCurrencies[0].id);
    }
  }, [availableCurrencies, primaryCurrencyId, selectedCurrencyId]);

  const closeAction = () => {
    setActiveAction(null);
    setAmount("");
    setNotes("");
    setReason("");
    setAdjustmentType("INGRESO");
  };

  const handleAudit = async () => {
    const normalizedAmount = amount.trim();
    const parsedAmount = Number(amount);
    if (!selectedCurrencyId || !normalizedAmount || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
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
    if (!selectedCurrencyId || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || !reason.trim()) {
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

  const currencyColor = (code: string) => {
    const currencyColors = colors.currencies as Record<string, { primary: string }> | undefined;
    return currencyColors?.[code.toLowerCase()]?.primary ?? colors.primary[500];
  };

  const currencyBackground = (code: string) => {
    const currencyColors = colors.currencies as Record<string, { bg: string }> | undefined;
    return currencyColors?.[code.toLowerCase()]?.bg ?? colors.primary[50];
  };

  if (overviewQuery.isLoading) {
    return (
      <SafeAreaView testID="cash-loading" style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator testID="cash-loading" size="large" color={colors.primary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        {...tabBarScrollBehavior}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={overviewQuery.isRefetching}
            onRefresh={() => { overviewQuery.refetch(); bankAccountsQuery.refetch(); }}
            tintColor={colors.primary[500]}
          />
        }
      >
        <FadeIn>
          <View style={styles.header}>
            <View style={styles.headerTitles}>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>Cash</Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Saldos y control de efectivo por moneda</Text>
            </View>
          </View>
        </FadeIn>

        {overviewQuery.isError ? (
          <View style={[styles.stateCard, { backgroundColor: colors.card }, shadows.sm]}>
            <Ionicons name="cloud-offline-outline" size={30} color={colors.danger} />
            <Text style={[styles.stateTitle, { color: colors.text.primary }]}>No se pudo cargar Caja</Text>
            <Text style={[styles.stateText, { color: colors.text.secondary }]}>Revisa tu conexión e intenta nuevamente.</Text>
            <Button title="Reintentar" onPress={() => overviewQuery.refetch()} size="sm" />
          </View>
        ) : (
          <>
            {balances.length > 0 ? (
              <FadeInDown delay={100}>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Saldos por moneda</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.balanceRow}>
                    {balances.map((balance, index) => {
                      const accent = currencyColor(balance.currency.code);
                      return (
                        <ScaleIn key={balance.id} delay={150 + index * 50}>
                          <View style={[styles.balanceCard, { backgroundColor: colors.card, borderLeftColor: accent }, shadows.sm]}>
                          <View style={[styles.currencyIcon, { backgroundColor: currencyBackground(balance.currency.code) }]}>
                              <Text style={[styles.currencySymbol, { color: colors.text.primary }]}>{balance.currency.symbol}</Text>
                          </View>
                            <Text style={[styles.currencyCode, { color: colors.text.secondary }]}>{balance.currency.code}</Text>
                            <Text style={[styles.balanceValue, { color: colors.text.primary }]}>{formatAmount(balance.balance, balance.currency.symbol)}</Text>
                          </View>
                        </ScaleIn>
                      );
                    })}
                  </ScrollView>
                </View>
              </FadeInDown>
            ) : (
              <View style={[styles.stateCard, { backgroundColor: colors.card }, shadows.sm]}>
                <Ionicons name="wallet-outline" size={30} color={colors.text.secondary} />
                <Text style={[styles.stateTitle, { color: colors.text.primary }]}>Caja sin saldos</Text>
                <Text style={[styles.stateText, { color: colors.text.secondary }]}>Registra un ajuste inicial para comenzar a operar.</Text>
              </View>
            )}

            {bankAccounts.length > 0 && (
              <FadeInDown delay={200}>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Saldos en Cuentas Bancarias</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.balanceRow}>
                    {bankAccounts.map((account, index) => {
                      const accent = currencyColor(account.currency.code);
                      return (
                        <ScaleIn key={account.id} delay={200 + index * 50}>
                          <View style={[styles.bankCard, { backgroundColor: colors.card, borderLeftColor: accent }, shadows.sm]}>
                            <View style={[styles.currencyIcon, { backgroundColor: currencyBackground(account.currency.code) }]}>
                              <Text style={[styles.currencySymbol, { color: colors.text.primary }]}>{account.currency.symbol}</Text>
                            </View>
                            <Text style={[styles.currencyCode, { color: colors.text.secondary }]} numberOfLines={1}>{account.name}</Text>
                            <Text style={[styles.bankName, { color: colors.text.secondary }]} numberOfLines={1}>{account.bankName}</Text>
                            <Text style={[styles.balanceValue, { color: colors.text.primary }]}>{formatAmount(account.balance, account.currency.symbol)}</Text>
                          </View>
                        </ScaleIn>
                      );
                    })}
                  </ScrollView>
                </View>
              </FadeInDown>
            )}

            <FadeInDown delay={250}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Acciones rápidas</Text>
                <QuickAction title="Arqueo de Caja" subtitle="Verificar saldo real" icon="checkmark-done" color={colors.primary[500]} onPress={() => setActiveAction("AUDIT")} cardColor={colors.card} textColor={colors.text.primary} secondaryColor={colors.text.secondary} shadow={shadows.sm} />
                <QuickAction title="Ajuste Manual" subtitle="Registrar ingreso o egreso" icon="settings-outline" color={colors.warning} onPress={() => setActiveAction("ADJUSTMENT")} cardColor={colors.card} textColor={colors.text.primary} secondaryColor={colors.text.secondary} shadow={shadows.sm} />
                <QuickAction title="Cuentas Bancarias" subtitle="Administrar cuentas bancarias" icon="business-outline" color={colors.warning} onPress={() => navigation.navigate("BankAccounts")} cardColor={colors.card} textColor={colors.text.primary} secondaryColor={colors.text.secondary} shadow={shadows.sm} />
                <QuickAction title="Monedas" subtitle="Gestionar monedas y principal" icon="cash-outline" color={colors.secondary[500]} onPress={() => navigation.navigate("Currencies")} cardColor={colors.card} textColor={colors.text.primary} secondaryColor={colors.text.secondary} shadow={shadows.sm} />
                <QuickAction title="Tasa de Cambio" subtitle="Configurar tasas de referencia" icon="swap-horizontal-outline" color={colors.success} onPress={() => navigation.navigate("ExchangeRates")} cardColor={colors.card} textColor={colors.text.primary} secondaryColor={colors.text.secondary} shadow={shadows.sm} />
                <QuickAction title="Objetivos" subtitle="Metas financieras y seguimiento" icon="flag-outline" color={colors.secondary[500]} onPress={() => navigation.navigate("Objectives")} cardColor={colors.card} textColor={colors.text.primary} secondaryColor={colors.text.secondary} shadow={shadows.sm} />
                <QuickAction title="Reportes" subtitle="Informes y análisis financieros" icon="bar-chart-outline" color={colors.primary[500]} onPress={() => navigation.navigate("Reports")} cardColor={colors.card} textColor={colors.text.primary} secondaryColor={colors.text.secondary} shadow={shadows.sm} />
              </View>
            </FadeInDown>

            <FadeInDown delay={350}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Movimientos recientes</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("CashHistory")} accessibilityRole="button" accessibilityLabel="Ver historial de caja">
                    <Text style={[styles.link, { color: colors.primary[500] }]}>Ver historial</Text>
                  </TouchableOpacity>
                </View>
                {overview?.recentMovements.length ? overview.recentMovements.slice(0, 5).map((movement) => (
                  <CashMovementCard key={movement.id} movement={{
                    id: movement.id,
                    title: movement.title,
                    subtitle: `${movement.description} · ${format(new Date(movement.createdAt), "d MMM, HH:mm", { locale: es })}`,
                    amount: movement.totalBase ?? movement.amount,
                    type: movement.direction === "IN" ? "INCOME" : "EXPENSE",
                    badgeLabel: movement.totalBase !== null ? overview.primaryCurrency?.code ?? movement.currency.code : movement.currency.code,
                    currencySymbol: movement.totalBase !== null ? overview.primaryCurrency?.symbol : movement.currency.symbol,
                  }} />
                )) : (
                  <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No hay movimientos recientes.</Text>
                )}
              </View>
            </FadeInDown>

            {overview?.latestAudits.length ? (
              <FadeInDown delay={450}>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Último arqueo</Text>
                  {overview.latestAudits.map((audit) => {
                    const status = audit.difference === 0 ? "Cuadrado" : audit.difference < 0 ? "Faltante" : "Sobrante";
                    const statusColor = audit.difference === 0 ? colors.success : audit.difference < 0 ? colors.danger : colors.warning;
                    return (
                      <View key={audit.id} style={[styles.auditCard, { backgroundColor: colors.card }, shadows.sm]}>
                        <View style={styles.auditHeader}>
                          <Text style={[styles.auditDate, { color: colors.text.secondary }]}>{format(new Date(audit.createdAt), "d MMM, yyyy · HH:mm", { locale: es })}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}><Text style={[styles.statusText, { color: statusColor }]}>{status}</Text></View>
                        </View>
                        <Text style={[styles.auditCurrency, { color: colors.text.primary }]}>{audit.currency.code}</Text>
                        <View style={styles.auditAmounts}>
                          <AuditAmount label="Esperado" value={formatAmount(audit.expectedBalance, audit.currency.symbol)} color={colors.text.primary} labelColor={colors.text.secondary} />
                          <AuditAmount label="Real" value={formatAmount(audit.actualBalance, audit.currency.symbol)} color={statusColor} labelColor={colors.text.secondary} />
                        </View>
                        <Text style={[styles.auditDifference, { color: statusColor }]}>Diferencia: {formatAmount(audit.difference, audit.currency.symbol)}</Text>
                        {audit.notes ? <Text style={[styles.auditNotes, { color: colors.text.secondary }]}>{audit.notes}</Text> : null}
                      </View>
                    );
                  })}
                </View>
              </FadeInDown>
            ) : null}

            <FadeInDown delay={500}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Tasas de Cambio</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("ExchangeRates")} accessibilityRole="button" accessibilityLabel="Ver todas las tasas">
                    <Text style={[styles.link, { color: colors.primary[500] }]}>Ver todas</Text>
                  </TouchableOpacity>
                </View>
                {exchangeRatesQuery.data?.length ? (
                  <View style={styles.chartCard}>
                    <BarChart
                      data={exchangeRatesQuery.data
                        .filter((r) => r.buyRate > 0)
                        .map((r) => ({
                          label: r.currency.code,
                          value: r.buyRate,
                          color: colors.primary[500],
                        }))}
                      height={100}
                      showLabels
                      showValues
                    />
                  </View>
                ) : (
                  <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No hay tasas configuradas.</Text>
                )}
              </View>
            </FadeInDown>
          </>
        )}
      </ScrollView>

      <Modal visible={activeAction !== null} transparent animationType="slide" onRequestClose={closeAction}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeAction} accessibilityLabel="Cerrar modal" />
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{activeAction === "AUDIT" ? "Registrar arqueo" : "Registrar ajuste"}</Text>
              <TouchableOpacity onPress={closeAction} accessibilityLabel="Cerrar"><Ionicons name="close" size={24} color={colors.text.secondary} /></TouchableOpacity>
            </View>
            <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Moneda</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.currencyOptions}>
              {availableCurrencies.map((currency) => {
                const selected = selectedCurrencyId === currency.id;
                return (
                  <TouchableOpacity key={currency.id} onPress={() => setSelectedCurrencyId(currency.id)} accessibilityRole="button" accessibilityState={{ selected }} style={[styles.currencyOption, { borderColor: selected ? colors.primary[500] : colors.border, backgroundColor: selected ? (isDark ? `${colors.primary[500]}25` : colors.primary[50]) : colors.card }]}>
                    <Text style={[styles.optionText, { color: selected ? colors.primary[500] : colors.text.secondary }]}>{currency.code}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Input label={activeAction === "AUDIT" ? "Saldo real" : "Monto"} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />
            {activeAction === "ADJUSTMENT" ? (
              <>
                <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Tipo</Text>
                <View style={styles.typeRow}>{(["INGRESO", "EGRESO"] as AdjustmentType[]).map((type) => {
                  const selected = adjustmentType === type;
                  return <TouchableOpacity key={type} onPress={() => setAdjustmentType(type)} style={[styles.typeOption, { borderColor: selected ? colors.primary[500] : colors.border, backgroundColor: selected ? colors.primary[50] : colors.card }]}><Text style={[styles.optionText, { color: selected ? colors.primary[500] : colors.text.secondary }]}>{type === "INGRESO" ? "Ingreso" : "Egreso"}</Text></TouchableOpacity>;
                })}</View>
                <Input label="Motivo" value={reason} onChangeText={setReason} placeholder="Motivo del ajuste" />
              </>
            ) : <Input label="Notas (opcional)" value={notes} onChangeText={setNotes} placeholder="Observaciones" multiline numberOfLines={3} />}
            <Button title={activeAction === "AUDIT" ? "Guardar arqueo" : "Guardar ajuste"} onPress={activeAction === "AUDIT" ? handleAudit : handleAdjustment} loading={createAuditMutation.isPending || createAdjustmentMutation.isPending} disabled={selectedCurrencyId === null} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const QuickAction = ({ title, subtitle, icon, color, onPress, cardColor, textColor, secondaryColor, shadow }: { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; color: string; onPress: () => void; cardColor: string; textColor: string; secondaryColor: string; shadow: object }) => (
  <ScaleIn><PressableScale onPress={onPress} style={styles.actionWrapper}><View style={[styles.actionCard, { backgroundColor: cardColor }, shadow]}><View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={22} color={color} /></View><View style={styles.actionInfo}><Text style={[styles.actionTitle, { color: textColor }]}>{title}</Text><Text style={[styles.actionSubtitle, { color: secondaryColor }]}>{subtitle}</Text></View><Ionicons name="chevron-forward" size={20} color={secondaryColor} /></View></PressableScale></ScaleIn>
);

const AuditAmount = ({ label, value, color, labelColor }: { label: string; value: string; color: string; labelColor: string }) => <View style={styles.auditAmount}><Text style={[styles.auditLabel, { color: labelColor }]}>{label}</Text><Text style={[styles.auditValue, { color }]}>{value}</Text></View>;

const styles = StyleSheet.create({
  container: { flex: 1 }, loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: floatingTabBarMetrics.contentBottomPadding }, header: { marginBottom: 24 }, headerTitles: { flex: 1, minWidth: 0 },
  title: { fontSize: 30, fontWeight: "800", marginBottom: 4 }, subtitle: { fontSize: 14 }, section: { marginBottom: 26 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balanceRow: { gap: 12, paddingBottom: 4 }, balanceCard: { width: 130, borderRadius: 16, padding: 16 }, bankCard: { width: 160, borderRadius: 16, padding: 16 }, bankName: { fontSize: 11, marginBottom: 4 },
  currencyIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 8 }, currencySymbol: { fontSize: 16, fontWeight: "700" },
  currencyCode: { fontSize: 13, marginBottom: 4 }, balanceValue: { fontSize: 18, fontWeight: "700" },
  stateCard: { alignItems: "center", borderRadius: 16, padding: 24, gap: 8, marginBottom: 26 }, stateTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" }, stateText: { fontSize: 14, textAlign: "center", marginBottom: 8 },
  actionWrapper: { marginBottom: 10 }, actionCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14 }, actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 }, actionInfo: { flex: 1 }, actionTitle: { fontSize: 15, fontWeight: "700" }, actionSubtitle: { fontSize: 12, marginTop: 2 },
  link: { fontSize: 14, fontWeight: "700", marginBottom: 12 }, emptyText: { fontSize: 14 }, chartCard: { marginTop: 12, marginBottom: 4 }, auditCard: { borderRadius: 16, padding: 18, marginBottom: 12 }, auditHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, auditDate: { fontSize: 12 }, statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }, statusText: { fontSize: 11, fontWeight: "800" }, auditCurrency: { fontSize: 16, fontWeight: "800", marginTop: 12 }, auditAmounts: { flexDirection: "row", marginTop: 14 }, auditAmount: { flex: 1 }, auditLabel: { fontSize: 11, marginBottom: 4 }, auditValue: { fontSize: 16, fontWeight: "800" }, auditDifference: { fontSize: 13, fontWeight: "700", marginTop: 14 }, auditNotes: { fontSize: 12, marginTop: 8 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" }, modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.4)" }, modalCard: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, gap: 12 }, modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, modalTitle: { fontSize: 20, fontWeight: "800" }, fieldLabel: { fontSize: 14, fontWeight: "600" }, currencyOptions: { gap: 8, paddingBottom: 4 }, currencyOption: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 }, optionText: { fontWeight: "700" }, typeRow: { flexDirection: "row", gap: 8 }, typeOption: { flex: 1, borderWidth: 1, borderRadius: 10, alignItems: "center", paddingVertical: 11 },
});
