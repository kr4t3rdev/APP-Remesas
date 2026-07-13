import React, { useEffect, useRef, useState } from "react";
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useColors } from "../../../store/themeStore";
import { useCreateTransactionMutation, useExchangeRatesQuery, usePositionsQuery } from "../../../modules/transactions/application/useTransactions";
import { calculateTransferPreview } from "../../../types/business";

export const TransactionModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const colors = useColors();
  const { mutate: createTx, isPending } = useCreateTransactionMutation();
  const rates = useExchangeRatesQuery();
  const positions = usePositionsQuery();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"COMPRA" | "VENTA">("COMPRA");
  const [currencyId, setCurrencyId] = useState(positions.data?.[0]?.currencyId ?? 0);
  const intentKey = useRef(`transfer-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  useEffect(() => {
    if (currencyId === 0 && positions.data?.[0]) {
      setCurrencyId(positions.data[0].currencyId);
    }
  }, [currencyId, positions.data]);
  const position = positions.data?.find((item) => item.currencyId === currencyId);
  const rateItem = rates.data?.find((item) => item.currencyId === currencyId);
  const rate = type === "COMPRA" ? rateItem?.buyRate ?? 0 : rateItem?.sellRate ?? 0;
  const preview = calculateTransferPreview({ type, amount: Number(amount), rate, position });

  const handleSave = () => {
    if (!preview.isValid || !currencyId) return;
    createTx({ type, currencyId, amount: Number(amount), rate, idempotencyKey: intentKey.current }, { onSuccess: () => { setAmount(""); onClose(); } });
  };

  return <Modal visible={visible} transparent animationType="slide" accessibilityViewIsModal>
    <View style={styles.overlay}><View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>Nueva transferencia</Text>
      <View accessibilityRole="radiogroup" style={styles.typeRow}>
        {(["COMPRA", "VENTA"] as const).map((option) => <TouchableOpacity key={option} accessibilityRole="radio" accessibilityState={{ selected: type === option }} onPress={() => setType(option)}><Text style={{ color: colors.text.primary }}>{option === "COMPRA" ? "Compra" : "Venta"}</Text></TouchableOpacity>)}
      </View>
      <TextInput accessibilityLabel="Monto de la transferencia" style={[styles.input, { borderColor: colors.border, color: colors.text.primary }]} placeholder="Monto" placeholderTextColor={colors.text.secondary} keyboardType="numeric" value={amount} onChangeText={setAmount} />
      {positions.data && positions.data.length > 1 ? positions.data.map((item) => <TouchableOpacity key={item.currencyId} accessibilityRole="radio" accessibilityState={{ selected: item.currencyId === currencyId }} onPress={() => setCurrencyId(item.currencyId)}><Text style={{ color: colors.text.primary }}>{typeof item.currency === "string" ? item.currency : item.currency?.code ?? item.currencyId}</Text></TouchableOpacity>) : null}
      <Text style={{ color: colors.text.secondary }}>Total: {preview.totalBase.toFixed(2)} · Saldo proyectado: {preview.projectedSaldo?.toFixed(2) ?? "—"}</Text>
      {amount && !preview.isValid ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 8 }}>{preview.validationMessage}</Text> : null}
      <View style={styles.actions}><TouchableOpacity accessibilityRole="button" onPress={onClose} style={[styles.button, { backgroundColor: colors.border }]}><Text style={{ color: colors.text.primary }}>Cancelar</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={handleSave} disabled={isPending || !preview.isValid} style={[styles.button, { backgroundColor: colors.primary[500], opacity: isPending || !preview.isValid ? 0.5 : 1 }]}><Text style={{ color: "#fff" }}>{isPending ? "Guardando..." : "Guardar"}</Text></TouchableOpacity></View>
    </View></View>
  </Modal>;
};

const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center" }, container: { width: "80%", padding: 20, borderRadius: 12, elevation: 5 }, title: { fontSize: 18, fontWeight: "bold", marginBottom: 16 }, input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 }, typeRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }, actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 }, button: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 } });
