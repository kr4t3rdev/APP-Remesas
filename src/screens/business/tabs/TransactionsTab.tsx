import React, { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "../../../store/themeStore";
import { usePositionsQuery, useRemittancesQuery, useTransactionsQuery } from "../../../modules/transactions/application/useTransactions";
import { TransactionModal } from "../../../components/business/modals/TransactionModal";
import { OpenPositionModal } from "../../../components/business/modals/OpenPositionModal";
import { useCashBalancesQuery } from "../../../modules/cash/application/useCash";
import type { Position, Remittance } from "../../../types/business";
import { isPositionReviewable } from "../../../types/business";
import { useCurrenciesWithPrimaryQuery } from "../../../modules/currencies/application/useCurrencies";

type TransactionsTabColors = ReturnType<typeof useColors>;

const PositionsSection = ({ colors, positions, hasHistoricalCash, onCreateOperation, onOpenHistoricalPosition }: { colors: TransactionsTabColors; positions: Position[]; hasHistoricalCash: boolean; onCreateOperation: () => void; onOpenHistoricalPosition: () => void }) => (
  <>
    <Text accessibilityRole="header" style={{ color: colors.text.secondary, fontSize: 13 }}>Posiciones</Text>
    {positions.length === 0 ? <Text style={{ color: colors.text.secondary, marginTop: 8 }}>Todavía no hay posiciones revisadas.</Text> : positions.map((position) => <View key={position.currencyId} accessibilityLabel={`Posición ${typeof position.currency === "string" ? position.currency : position.currency?.code ?? position.currencyId}`} style={{ paddingVertical: 10 }}><Text style={{ color: colors.text.primary, fontWeight: "700" }}>{typeof position.currency === "string" ? position.currency : position.currency?.code ?? `Moneda ${position.currencyId}`}</Text><Text style={{ color: colors.text.secondary }}>Saldo: {position.saldo.toFixed(2)} · Costo promedio: {position.costoPromedio?.toFixed(2) ?? "No disponible"}</Text>{isPositionReviewable(position) ? <Text style={{ color: colors.warning }}>Pendiente de revisión</Text> : null}</View>)}
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Nueva operación" onPress={onCreateOperation} style={{ backgroundColor: colors.primary[500], padding: 12, borderRadius: 8, marginTop: 8 }}><Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>Nueva operación</Text></TouchableOpacity>
    {hasHistoricalCash ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Abrir posición histórica" onPress={onOpenHistoricalPosition} style={{ borderColor: colors.primary[500], borderWidth: 1, padding: 12, borderRadius: 8, marginTop: 8 }}><Text style={{ color: colors.primary[500], textAlign: "center", fontWeight: "700" }}>Abrir posición histórica</Text></TouchableOpacity> : null}
  </>
);

const RemittancesSection = ({ colors, remittances }: { colors: TransactionsTabColors; remittances: Remittance[] }) => (
  <>
    <Text accessibilityRole="header" style={{ color: colors.text.secondary, fontSize: 13, marginTop: 18 }}>Remesas</Text>
    {remittances.length === 0 ? <Text style={{ color: colors.text.secondary, marginTop: 8 }}>No hay remesas para mostrar.</Text> : remittances.map((remittance) => { const label = remittance.provider ?? "Manual"; return <Text key={String(remittance.id)} accessibilityLabel={`Remesa ${label} ${remittance.status}`} style={{ color: colors.text.primary, paddingVertical: 8 }}>{label} · {remittance.status}{remittance.duplicate ? " · duplicada segura" : ""}</Text>; })}
  </>
);

const OperationRow = ({ colors, item }: { colors: TransactionsTabColors; item: { type: string; currency?: { code: string }; amount: number; rate: number; marginProfit: number } }) => (
  <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={{ color: colors.text.primary, fontWeight: "700" }}>{item.type === "COMPRA" ? "Compra" : "Venta"} · {item.currency?.code}</Text><Text style={{ color: colors.text.secondary }}>{item.amount.toFixed(2)} · Tasa {item.rate.toFixed(2)}</Text><Text style={{ color: colors.text.secondary }}>Rendimiento: {item.marginProfit.toFixed(2)}</Text></View>
);

export const TransactionsTab = () => {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [openPositionVisible, setOpenPositionVisible] = useState(false);
  const transactions = useTransactionsQuery();
  const positions = usePositionsQuery();
  const remittances = useRemittancesQuery();
  const cashBalances = useCashBalancesQuery();
  const currenciesWithPrimary = useCurrenciesWithPrimaryQuery();
  const hasHistoricalCash = (cashBalances.data ?? []).some((balance) =>
    Number(balance.balance) > 0
    && balance.currencyId !== currenciesWithPrimary.data?.primaryCurrencyId
    && balance.currency?.isActive !== false
    && !(positions.data ?? []).some(
      (position) => position.currencyId === balance.currencyId && !isPositionReviewable(position),
    ),
  );
  const isLoading = transactions.isLoading || positions.isLoading || remittances.isLoading || cashBalances.isLoading || currenciesWithPrimary.isLoading;
  const hasError = Boolean(transactions.error || positions.error || remittances.error || cashBalances.error || currenciesWithPrimary.error);
  const refresh = async () => Promise.all([transactions.refetch(), positions.refetch(), remittances.refetch(), cashBalances.refetch(), currenciesWithPrimary.refetch()]);

  if (isLoading) return <View accessibilityLabel="Cargando transacciones" style={{ padding: 24 }}><ActivityIndicator color={colors.primary[500]} /></View>;
  if (hasError) return <View style={{ padding: 24 }}><Text accessibilityRole="alert" style={{ color: colors.text.primary }}>No se pudieron cargar las operaciones.</Text><TouchableOpacity accessibilityRole="button" onPress={refresh}><Text style={{ color: colors.primary[500], marginTop: 12 }}>Reintentar</Text></TouchableOpacity></View>;

  return <View style={{ flex: 1 }}>
    <FlatList
      accessibilityLabel="Resumen de posiciones y operaciones"
      data={transactions.data ?? []}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={transactions.isFetching} onRefresh={refresh} />}
      ListHeaderComponent={<View style={{ padding: 16 }}>
        <PositionsSection colors={colors} positions={positions.data ?? []} hasHistoricalCash={hasHistoricalCash} onCreateOperation={() => setModalVisible(true)} onOpenHistoricalPosition={() => setOpenPositionVisible(true)} />
        <RemittancesSection colors={colors} remittances={remittances.data ?? []} />
        <Text accessibilityRole="header" style={{ color: colors.text.secondary, fontSize: 13, marginTop: 18 }}>Operaciones</Text>
      </View>}
      renderItem={({ item }) => <OperationRow colors={colors} item={item} />}
      ListEmptyComponent={<Text style={{ color: colors.text.secondary, padding: 16 }}>No hay operaciones todavía.</Text>}
    />
    {modalVisible ? <TransactionModal visible onClose={() => setModalVisible(false)} /> : null}
    <OpenPositionModal visible={openPositionVisible} positions={positions.data ?? []} onClose={() => setOpenPositionVisible(false)} />
  </View>;
};
