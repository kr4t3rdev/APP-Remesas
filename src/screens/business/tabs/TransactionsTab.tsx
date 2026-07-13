import React, { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "../../../store/themeStore";
import { usePositionsQuery, useRemittancesQuery, useTransactionsQuery } from "../../../modules/transactions/application/useTransactions";
import { TransactionModal } from "../../../components/business/modals/TransactionModal";
import type { Position } from "../../../types/business";

export const TransactionsTab = () => {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const transactions = useTransactionsQuery();
  const positions = usePositionsQuery();
  const remittances = useRemittancesQuery();
  const isLoading = transactions.isLoading || positions.isLoading || remittances.isLoading;
  const hasError = Boolean(transactions.error || positions.error || remittances.error);
  const refresh = async () => Promise.all([transactions.refetch(), positions.refetch(), remittances.refetch()]);

  if (isLoading) return <View accessibilityLabel="Cargando transacciones" style={{ padding: 24 }}><ActivityIndicator color={colors.primary[500]} /></View>;
  if (hasError) return <View style={{ padding: 24 }}><Text accessibilityRole="alert" style={{ color: colors.text.primary }}>No se pudieron cargar las transferencias.</Text><TouchableOpacity accessibilityRole="button" onPress={refresh}><Text style={{ color: colors.primary[500], marginTop: 12 }}>Reintentar</Text></TouchableOpacity></View>;

  return <View style={{ flex: 1 }}>
    <FlatList
      accessibilityLabel="Resumen de posiciones y transferencias"
      data={transactions.data ?? []}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={transactions.isFetching} onRefresh={refresh} />}
      ListHeaderComponent={<View style={{ padding: 16 }}>
        <Text accessibilityRole="header" style={{ color: colors.text.secondary, fontSize: 13 }}>Posiciones</Text>
        {(positions.data ?? []).length === 0 ? <Text style={{ color: colors.text.secondary, marginTop: 8 }}>Todavía no hay posiciones revisadas.</Text> : (positions.data ?? []).map((position: Position) => <View key={position.currencyId} accessibilityLabel={`Posición ${typeof position.currency === "string" ? position.currency : position.currency?.code ?? position.currencyId}`} style={{ paddingVertical: 10 }}><Text style={{ color: colors.text.primary, fontWeight: "700" }}>{typeof position.currency === "string" ? position.currency : position.currency?.code ?? `Moneda ${position.currencyId}`}</Text><Text style={{ color: colors.text.secondary }}>Saldo: {position.saldo.toFixed(2)} · Costo promedio: {position.costoPromedio?.toFixed(2) ?? "No disponible"}</Text></View>)}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Nueva transferencia" onPress={() => setModalVisible(true)} style={{ backgroundColor: colors.primary[500], padding: 12, borderRadius: 8, marginTop: 8 }}><Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>Nueva transferencia</Text></TouchableOpacity>
        <Text accessibilityRole="header" style={{ color: colors.text.secondary, fontSize: 13, marginTop: 18 }}>Remesas</Text>
        {(remittances.data ?? []).length === 0 ? <Text style={{ color: colors.text.secondary, marginTop: 8 }}>No hay remesas para mostrar.</Text> : (remittances.data ?? []).map((remittance) => <Text key={remittance.id} accessibilityLabel={`Remesa ${remittance.provider} ${remittance.status}`} style={{ color: colors.text.primary, paddingVertical: 8 }}>{remittance.provider} · {remittance.status}{remittance.duplicate ? " · duplicada segura" : ""}</Text>)}
        <Text accessibilityRole="header" style={{ color: colors.text.secondary, fontSize: 13, marginTop: 18 }}>Operaciones</Text>
      </View>}
      renderItem={({ item }) => <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={{ color: colors.text.primary, fontWeight: "700" }}>{item.type === "COMPRA" ? "Compra" : "Venta"} · {item.currency?.code}</Text><Text style={{ color: colors.text.secondary }}>{item.amount.toFixed(2)} · Tasa {item.rate.toFixed(2)} · {item.status}</Text><Text style={{ color: colors.text.secondary }}>Rendimiento: {item.marginProfit.toFixed(2)}</Text></View>}
      ListEmptyComponent={<Text style={{ color: colors.text.secondary, padding: 16 }}>No hay transferencias todavía.</Text>}
    />
    <TransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
  </View>;
};
