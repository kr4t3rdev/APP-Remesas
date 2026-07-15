import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useColors } from "../../../store/themeStore";
import { useCreateTransactionMutation, useCurrenciesQuery, useExchangeRatesQuery, usePositionsQuery } from "../../../modules/transactions/application/useTransactions";
import { useBankAccountsQuery } from "../../../modules/bank-accounts/application/useBankAccounts";
import { useCashBalancesQuery } from "../../../modules/cash/application/useCash";
import { calculateTransferPreview } from "../../../types/business";

type AccountOption = { key: string; type: "CASH" | "BANK_ACCOUNT"; id?: number; label: string; currencyId: number; balance: number; active: boolean };

export const TransactionModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const colors = useColors();
  const { mutate: createTx, isPending } = useCreateTransactionMutation();
  const rates = useExchangeRatesQuery();
  const positions = usePositionsQuery();
  const currencies = useCurrenciesQuery();
  const banks = useBankAccountsQuery();
  const cash = useCashBalancesQuery();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"COMPRA" | "VENTA">("COMPRA");
  const [currencyId, setCurrencyId] = useState(positions.data?.[0]?.currencyId ?? 0);
  const [sourceKey, setSourceKey] = useState<string>();
  const [destinationKey, setDestinationKey] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const intentKey = useRef(`transfer-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  useEffect(() => { if (currencyId === 0 && positions.data?.[0]) setCurrencyId(positions.data[0].currencyId); }, [currencyId, positions.data]);
  const position = positions.data?.find((item) => item.currencyId === currencyId);
  const rateItem = rates.data?.find((item) => item.currencyId === currencyId);
  const rate = type === "COMPRA" ? rateItem?.buyRate ?? 0 : rateItem?.sellRate ?? 0;
  const preview = calculateTransferPreview({ type, amount: Number(amount), rate, position });
  const baseCurrencyId = currencies.data?.find((item) => item.id !== currencyId)?.id ?? currencies.data?.[0]?.id ?? 0;
  const sourceCurrencyId = type === "COMPRA" ? baseCurrencyId : currencyId;
  const destinationCurrencyId = type === "COMPRA" ? currencyId : baseCurrencyId;
  const accounts = useMemo<AccountOption[]>(() => {
    const cashAccounts = (cash.data ?? []).map((item) => ({ key: `CASH:${item.currencyId}`, type: "CASH" as const, label: `Caja · ${item.currency?.code ?? item.currencyId}`, currencyId: item.currencyId, balance: item.balance, active: true }));
    const knownCurrencyIds = new Set(cashAccounts.map((item) => item.currencyId));
    const fallbackCash = (positions.data ?? []).filter((item) => !knownCurrencyIds.has(item.currencyId)).map((item) => ({ key: `CASH:${item.currencyId}`, type: "CASH" as const, label: `Caja · ${typeof item.currency === "string" ? item.currency : item.currency?.code ?? item.currencyId}`, currencyId: item.currencyId, balance: item.saldo, active: true }));
    if (baseCurrencyId && !knownCurrencyIds.has(baseCurrencyId) && !fallbackCash.some((item) => item.currencyId === baseCurrencyId)) fallbackCash.push({ key: `CASH:${baseCurrencyId}`, type: "CASH" as const, label: `Caja · ${baseCurrencyId}`, currencyId: baseCurrencyId, balance: Number.MAX_SAFE_INTEGER, active: true });
    return [...cashAccounts, ...fallbackCash, ...(banks.data ?? []).map((item) => ({ key: `BANK_ACCOUNT:${item.id}`, type: "BANK_ACCOUNT" as const, id: item.id, label: `${item.bankName} · ${item.name}`, currencyId: item.currencyId, balance: item.balance, active: item.isActive }))];
  }, [banks.data, cash.data, positions.data, baseCurrencyId]);
  const sourceOptions = accounts.filter((item) => item.active && item.currencyId === sourceCurrencyId && item.balance >= (Number(amount) || 0));
  const destinationOptions = accounts.filter((item) => item.active && item.currencyId === destinationCurrencyId);
  const source = accounts.find((item) => item.key === sourceKey);
  const destination = accounts.find((item) => item.key === destinationKey);
  useEffect(() => { if (!sourceOptions.some((item) => item.key === sourceKey)) setSourceKey(sourceOptions[0]?.key); }, [sourceKey, sourceOptions]);
  useEffect(() => { if (!destinationOptions.some((item) => item.key === destinationKey)) setDestinationKey(destinationOptions[0]?.key); }, [destinationKey, destinationOptions]);

  const handleSave = () => {
    if (!preview.isValid || !currencyId || !source || !destination) return;
    setSaveStatus("idle");
    createTx({ type, currencyId, amount: Number(amount), rate, idempotencyKey: intentKey.current, sourceType: source.type, sourceBankAccountId: source.id, destinationType: destination.type, destinationBankAccountId: destination.id }, {
      onSuccess: () => { setAmount(""); setSaveStatus("success"); }, onError: () => setSaveStatus("error"),
    });
  };
  const renderAccountPicker = (title: string, options: AccountOption[], selected: string | undefined, onSelect: (key: string) => void) => <View><Text style={{ color: colors.text.primary, marginTop: 10 }}>{title}</Text>{options.length === 0 ? <Text style={{ color: colors.danger }}>No hay cuentas activas con moneda/saldo compatible.</Text> : options.map((item) => <TouchableOpacity key={item.key} accessibilityRole="radio" accessibilityLabel={item.label} accessibilityState={{ selected: item.key === selected }} onPress={() => onSelect(item.key)} style={[styles.accountOption, { borderColor: colors.border }]}><Text style={{ color: colors.text.primary }}>{item.label}</Text><Text style={{ color: colors.text.secondary }}>{item.balance.toFixed(2)}</Text></TouchableOpacity>)}</View>;

  return <Modal visible={visible} transparent animationType="slide" accessibilityViewIsModal><View style={styles.overlay}><View accessibilityLabel="Nueva operación" style={[styles.container, { backgroundColor: colors.card }]}>
    <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>Nueva operación</Text>
    <View accessibilityRole="radiogroup" style={styles.typeRow}>{(["COMPRA", "VENTA"] as const).map((option) => <TouchableOpacity key={option} accessibilityRole="radio" accessibilityLabel={option === "COMPRA" ? "Compra" : "Venta"} accessibilityState={{ selected: type === option }} onPress={() => setType(option)} style={styles.radioOption}><Text style={{ color: colors.text.primary }}>{option === "COMPRA" ? "Compra" : "Venta"}</Text></TouchableOpacity>)}</View>
    <Text style={{ color: colors.text.primary, marginBottom: 6 }}>Monto de la operación</Text><TextInput accessibilityLabel="Monto de la operación" style={[styles.input, { borderColor: colors.border, color: colors.text.primary }]} placeholder="Monto" placeholderTextColor={colors.text.secondary} keyboardType="numeric" value={amount} onChangeText={setAmount} />
    {positions.data && positions.data.length > 1 ? positions.data.map((item) => <TouchableOpacity key={item.currencyId} accessibilityRole="radio" accessibilityLabel={typeof item.currency === "string" ? item.currency : item.currency?.code ?? `Moneda ${item.currencyId}`} accessibilityState={{ selected: item.currencyId === currencyId }} onPress={() => setCurrencyId(item.currencyId)} style={styles.radioOption}><Text style={{ color: colors.text.primary }}>{typeof item.currency === "string" ? item.currency : item.currency?.code ?? item.currencyId}</Text></TouchableOpacity>) : null}
    {renderAccountPicker("Origen", sourceOptions, sourceKey, setSourceKey)}{renderAccountPicker("Destino", destinationOptions, destinationKey, setDestinationKey)}
    <Text style={{ color: colors.text.secondary }}>Total: {preview.totalBase.toFixed(2)} · Saldo proyectado: {preview.projectedSaldo?.toFixed(2) ?? "—"}</Text>
    <Text accessibilityRole="summary" style={{ color: colors.text.secondary, marginTop: 10 }}>Resumen: salen {amount || "0"} de {source?.label ?? "—"} y entran {preview.totalBase.toFixed(2)} en {destination?.label ?? "—"}</Text>
    {saveStatus === "success" ? <Text accessibilityRole="alert" style={{ color: colors.success, marginTop: 8 }}>Operación guardada correctamente.</Text> : null}{saveStatus === "error" ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 8 }}>No se pudo guardar la operación. Intentá nuevamente.</Text> : null}{amount && (!preview.isValid || !source || !destination) ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 8 }}>{!preview.isValid ? preview.validationMessage : "Seleccioná origen y destino compatibles"}</Text> : null}
    <View style={styles.actions}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancelar" onPress={onClose} style={[styles.button, { backgroundColor: colors.border }]}><Text style={{ color: colors.text.primary }}>Cancelar</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel={isPending ? "Guardando" : "Guardar"} onPress={handleSave} disabled={isPending || !preview.isValid || !source || !destination} style={[styles.button, { backgroundColor: colors.primary[500], opacity: isPending || !preview.isValid || !source || !destination ? 0.5 : 1 }]}><Text style={{ color: "#fff" }}>{isPending ? "Guardando..." : "Guardar"}</Text></TouchableOpacity></View>
  </View></View></Modal>;
};
const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center" }, container: { width: "80%", maxHeight: "95%", padding: 20, borderRadius: 12, elevation: 5 }, title: { fontSize: 18, fontWeight: "bold", marginBottom: 16 }, input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8, minHeight: 44 }, typeRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }, radioOption: { minHeight: 44, minWidth: 80, justifyContent: "center", alignItems: "center" }, accountOption: { minHeight: 44, borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 6, flexDirection: "row", justifyContent: "space-between" }, actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 }, button: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: "center", borderRadius: 8 } });
