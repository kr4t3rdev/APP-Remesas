import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useColors } from "../../../store/themeStore";
import { FadeInOverlay } from "../../animations";
import { useCreateTransactionMutation, useCurrenciesQuery, useExchangeRatesQuery, usePositionsQuery } from "../../../modules/transactions/application/useTransactions";
import { useBankAccountsQuery } from "../../../modules/bank-accounts/application/useBankAccounts";
import { useCashBalancesQuery } from "../../../modules/cash/application/useCash";
import { calculateTransferPreview } from "../../../types/business";
import type { WorkerBalance } from "../../../types/worker";
import { parseDecimalInput } from "../../../utils/numberValidation";
import { useCurrenciesWithPrimaryQuery } from "../../../modules/currencies/application/useCurrencies";

type AccountOption = { key: string; type: "CASH" | "BANK_ACCOUNT"; id?: number; label: string; currencyId: number; balance: number; active: boolean };

type TransactionModalProps = {
  visible: boolean;
  onClose: () => void;
  worker?: { id: number; name: string; balances?: WorkerBalance[] } | null;
};

export const TransactionModal = ({ visible, onClose, worker }: TransactionModalProps) => {
  const colors = useColors();
  const { mutate: createTx, isPending } = useCreateTransactionMutation();
  const rates = useExchangeRatesQuery();
  const positions = usePositionsQuery();
  const currencies = useCurrenciesQuery();
  const currenciesWithPrimary = useCurrenciesWithPrimaryQuery();
  const banks = useBankAccountsQuery();
  const cash = useCashBalancesQuery();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"COMPRA" | "VENTA">("COMPRA");
  const [operationKind, setOperationKind] = useState<"TRANSFER" | "REMITTANCE">("TRANSFER");
  const [rateInput, setRateInput] = useState("");
  const [persistRate, setPersistRate] = useState(false);
  const [currencyId, setCurrencyId] = useState(positions.data?.[0]?.currencyId ?? 0);
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const [sourceKey, setSourceKey] = useState<string>();
  const [destinationKey, setDestinationKey] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | undefined>();
  const [savedRateMessage, setSavedRateMessage] = useState<string>();
  const [workerProfit, setWorkerProfit] = useState("");
  const [workerCurrencyId, setWorkerCurrencyId] = useState<number>();
  const createIntentKey = () => `transfer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const intentKey = useRef(createIntentKey());

  const primaryCurrencyId = currenciesWithPrimary.data?.primaryCurrencyId ?? undefined;
  const primaryCurrency = currenciesWithPrimary.data?.currencies.find((item) => item.id === primaryCurrencyId)
    ?? currencies.data?.find((item) => item.id === primaryCurrencyId);
  const currentRateByCurrencyId = useMemo(() => {
    const latestRates = new Map<number, NonNullable<typeof rates.data>[number]>();
    for (const item of rates.data ?? []) {
      const current = latestRates.get(item.currencyId);
      const itemTime = item.effectiveDate ? Date.parse(item.effectiveDate) : 0;
      const currentTime = current?.effectiveDate ? Date.parse(current.effectiveDate) : 0;
      if (!current || itemTime > currentTime || (itemTime === currentTime && item.id > current.id)) {
        latestRates.set(item.currencyId, item);
      }
    }
    return latestRates;
  }, [rates.data]);
  const ratedCurrencies = useMemo(() => {
    const currencyById = new Map((currencies.data ?? []).map((item) => [item.id, item]));
    return [...currentRateByCurrencyId.values()]
      .filter((item) => item.currencyId !== primaryCurrencyId && item.buyRate > 0 && item.sellRate > 0)
      .map((item) => currencyById.get(item.currencyId) ?? item.currency)
      .filter((item): item is NonNullable<typeof item> => Boolean(item && item.isActive !== false));
  }, [primaryCurrencyId, currencies.data, currentRateByCurrencyId]);
  useEffect(() => {
    if (!ratedCurrencies.some((item) => item.id === currencyId)) {
      setCurrencyId(ratedCurrencies[0]?.id ?? 0);
    }
  }, [currencyId, ratedCurrencies]);
  const selectedCurrencyId = ratedCurrencies.some((item) => item.id === currencyId)
    ? currencyId
    : ratedCurrencies[0]?.id ?? 0;
  const selectedCurrency = ratedCurrencies.find((item) => item.id === selectedCurrencyId);
  const workerCurrencyOptions = useMemo(
    () => (worker?.balances ?? []).filter((balance) => balance.currency?.isActive !== false),
    [worker?.balances],
  );
  useEffect(() => {
    if (!worker) {
      setWorkerCurrencyId(undefined);
      return;
    }
    if (!workerCurrencyOptions.some((balance) => balance.currencyId === workerCurrencyId)) {
      setWorkerCurrencyId(workerCurrencyOptions[0]?.currencyId);
    }
  }, [worker, workerCurrencyId, workerCurrencyOptions]);
  const existingPosition = positions.data?.find((item) => item.currencyId === selectedCurrencyId);
  const position = type === "COMPRA" && selectedCurrencyId
    ? existingPosition ?? { currencyId: selectedCurrencyId, saldo: 0, costoPromedio: null, availableForSale: false }
    : existingPosition;
  const rateItem = currentRateByCurrencyId.get(selectedCurrencyId);
  const activeRate = type === "COMPRA" ? rateItem?.buyRate ?? 0 : rateItem?.sellRate ?? 0;
  useEffect(() => {
    setRateInput(activeRate > 0 ? String(activeRate) : "");
  }, [activeRate, selectedCurrencyId, type]);
  useEffect(() => {
    if (visible) return;
    setAmount("");
    setOperationKind("TRANSFER");
    setPersistRate(false);
    setSavedRateMessage(undefined);
    setSaveStatus("idle");
    setSaveErrorMessage(undefined);
    setWorkerProfit("");
    setWorkerCurrencyId(undefined);
    setRateInput(activeRate > 0 ? String(activeRate) : "");
  }, [activeRate, visible]);
  const parsedAmount = parseDecimalInput(amount, { min: 0.01, max: 9999999999999.99, maxDecimalPlaces: 2 });
  const parsedRate = parseDecimalInput(rateInput, { min: 0.0001, max: 999999.9999, maxDecimalPlaces: 4 });
  const parsedWorkerProfit = workerProfit.trim()
    ? parseDecimalInput(workerProfit, { min: 0, max: 9999999999999.99, maxDecimalPlaces: 2 })
    : 0;
  const isRateValid = parsedRate !== null;
  const rate = parsedRate ?? 0;
  const amountValidationError = amount.length > 0 && parsedAmount === null
    ? "Ingresá un monto válido de hasta 2 decimales."
    : undefined;
  const rateValidationError = rateInput.length > 0 && !isRateValid
    ? "Ingresá una tasa válida entre 0.0001 y 999999.9999, con hasta 4 decimales."
    : undefined;
  const workerProfitValidationError = workerProfit.length > 0 && parsedWorkerProfit === null
    ? "Ingresá una ganancia válida de hasta 2 decimales."
    : undefined;
  const preview = calculateTransferPreview({ type, amount: parsedAmount ?? 0, rate, position });
  const sourceCurrencyId = type === "COMPRA" ? primaryCurrencyId : selectedCurrencyId;
  const destinationCurrencyId = type === "COMPRA" ? selectedCurrencyId : primaryCurrencyId;
  const accounts = useMemo<AccountOption[]>(() => {
    const cashByCurrencyId = new Map((cash.data ?? []).map((item) => [item.currencyId, item]));
    // Solo mostrar cajas que existan realmente en el backend. Si mostramos una
    // caja "fantasma" (sin registro), el backend la rechaza con "Caja no
    // encontrada" aunque el usuario la vea en la lista.
    const cashAccounts = (currencies.data ?? [])
      .filter((item) => item.isActive !== false)
      .filter((item) => cashByCurrencyId.has(item.id))
      .map((currency) => {
        const cashBalance = cashByCurrencyId.get(currency.id)!;
        return { key: `CASH:${currency.id}`, type: "CASH" as const, label: `Caja · ${currency.code}`, currencyId: currency.id, balance: Number(cashBalance.balance) || 0, active: true };
      });
    const bankAccounts = worker ? [] : (banks.data ?? []).map((item) => ({ key: `BANK_ACCOUNT:${item.id}`, type: "BANK_ACCOUNT" as const, id: item.id, label: `${item.bankName} · ${item.name}`, currencyId: item.currencyId, balance: Number(item.balance) || 0, active: item.isActive }));
    return [...cashAccounts, ...bankAccounts];
  }, [banks.data, cash.data, currencies.data, worker]);
  const sourceDebit = type === "COMPRA" ? (parsedAmount ?? 0) * rate : parsedAmount ?? 0;
  const workerSaleBalance = worker && type === "VENTA"
    ? workerCurrencyOptions.find((balance) => balance.currencyId === selectedCurrencyId)
    : undefined;
  const sourceOptions = worker && type === "VENTA"
    ? workerSaleBalance && Number(workerSaleBalance.balance) >= sourceDebit
      ? [{
          key: `WORKER_BALANCE:${worker.id}:${workerSaleBalance.currencyId}`,
          type: "CASH" as const,
          label: `Saldo trabajador · ${workerSaleBalance.currency?.code ?? workerSaleBalance.currencyId}`,
          currencyId: workerSaleBalance.currencyId,
          balance: Number(workerSaleBalance.balance) || 0,
          active: true,
        }]
      : []
    : sourceCurrencyId
      ? accounts.filter((item) => item.active && item.currencyId === sourceCurrencyId && item.balance > 0 && item.balance >= sourceDebit)
      : [];
  const currencyConfigurationError = !primaryCurrencyId || !primaryCurrency
    ? "Configuración incompleta: no se encontró la moneda principal configurada."
    : undefined;
  const destinationOptions = accounts.filter((item) => item.active && item.currencyId === destinationCurrencyId);
  const source = sourceOptions.find((item) => item.key === sourceKey);
  const destination = destinationOptions.find((item) => item.key === destinationKey);
  useEffect(() => { if (!sourceOptions.some((item) => item.key === sourceKey)) setSourceKey(sourceOptions[0]?.key); }, [sourceKey, sourceOptions]);
  useEffect(() => { if (!destinationOptions.some((item) => item.key === destinationKey)) setDestinationKey(destinationOptions[0]?.key); }, [destinationKey, destinationOptions]);

  const notes = worker
    ? `Trabajador: ${worker.name} (ID: ${worker.id})${workerProfit ? `, Ganancia: ${workerCurrencyOptions.find((balance) => balance.currencyId === workerCurrencyId)?.currency?.symbol ?? workerCurrencyOptions.find((balance) => balance.currencyId === workerCurrencyId)?.currency?.code ?? ""}${workerProfit}` : ""}`
    : undefined;

  const workerCurrencyValidationError = worker && !workerCurrencyId
    ? "El trabajador no tiene un saldo monetario seleccionado. Agregá saldo antes de registrar la operación."
    : undefined;
  const canSubmit = preview.isValid && parsedAmount !== null && parsedRate !== null && !workerProfitValidationError
    && Boolean(selectedCurrencyId && primaryCurrencyId && source && destination)
    && (!worker || Boolean(workerCurrencyId));
  const handleSave = () => {
    if (!canSubmit || !source || !destination) return;
    setSaveStatus("idle");
    setSaveErrorMessage(undefined);
    setSavedRateMessage(undefined);
    createTx({ type, currencyId: selectedCurrencyId, amount: parsedAmount!, rate, operationKind, persistRate, notes, idempotencyKey: intentKey.current, sourceType: source.type, sourceBankAccountId: source.id, destinationType: destination.type, destinationBankAccountId: destination.id, ...(worker && workerCurrencyId ? { workerId: worker.id, workerProfit: parsedWorkerProfit ?? 0, workerCurrencyId } : {}) }, {
        onSuccess: (response) => {
        setAmount("");
        setSaveStatus("success");
        intentKey.current = createIntentKey();

        if (persistRate) {
          const effectiveRate = Number(response?.transaction?.rate ?? response?.transaction?.appliedRate ?? rate);
          setSavedRateMessage(`Tasa actual guardada: ${effectiveRate}`);
          setRateInput(String(effectiveRate));
        }
        setPersistRate(false);
        setOperationKind("TRANSFER");
      }, onError: (error: any) => {
        setSaveStatus("error");
        setSaveErrorMessage(error?.response?.data?.message || error?.message);
      },
    });
  };
  const renderAccountPicker = (title: "Origen" | "Destino", options: AccountOption[], selected: string | undefined, onSelect: (key: string) => void) => <View><Text style={{ color: colors.text.primary, marginTop: 8, fontSize: 15 }}>{title}</Text>{options.length === 0 ? <Text style={{ color: colors.danger, fontSize: 14 }}>{title === "Origen" ? worker && type === "VENTA" ? "El trabajador no tiene saldo suficiente en la moneda seleccionada." : "No hay fondos suficientes en Caja o cuentas bancarias para esta operación." : "No hay destinos activos para la moneda seleccionada."}</Text> : <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 130 }}>{options.map((item) => <TouchableOpacity key={item.key} accessibilityRole="radio" accessibilityLabel={item.label} accessibilityState={{ selected: item.key === selected }} onPress={() => onSelect(item.key)} style={[styles.accountOption, { borderColor: colors.border }]}><Text style={{ color: colors.text.primary, fontSize: 14 }}>{item.label}</Text><Text style={{ color: colors.text.secondary, fontSize: 13 }}>{(Number(item.balance) || 0).toFixed(2)}</Text></TouchableOpacity>)}</ScrollView>}</View>;

  return <Modal visible={visible} transparent animationType="slide" accessibilityViewIsModal onRequestClose={onClose}><View style={styles.overlay}><FadeInOverlay targetOpacity={0.25} /><ScrollView accessibilityLabel="Nueva operación" automaticallyAdjustKeyboardInsets nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={styles.containerContent} style={[styles.container, { backgroundColor: colors.card }]}>
    <View style={styles.dragHandle} />
    <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>Nueva operación</Text>
    {worker ? <View style={{ backgroundColor: colors.primary[100] + "40", padding: 8, borderRadius: 8, marginBottom: 10 }}><Text style={{ color: colors.primary[500], fontWeight: "600", fontSize: 14 }}>Trabajador: {worker.name}</Text></View> : null}
    <View accessibilityRole="tablist" style={styles.typeRow}>{(["TRANSFER", "REMITTANCE"] as const).map((option) => <TouchableOpacity key={option} accessibilityRole="tab" accessibilityLabel={option === "TRANSFER" ? "Transferencia" : "Remesas"} accessibilityState={{ selected: operationKind === option }} onPress={() => setOperationKind(option)} style={[styles.tabOption, operationKind === option && { borderBottomColor: colors.primary[500] }]}><Text style={{ color: operationKind === option ? colors.primary[500] : colors.text.primary, fontWeight: operationKind === option ? "600" : "400", fontSize: 15 }}>{option === "TRANSFER" ? "Transferencia" : "Remesas"}</Text></TouchableOpacity>)}</View>
    <View accessibilityRole="radiogroup" style={styles.typeRow}>{(["COMPRA", "VENTA"] as const).map((option) => <TouchableOpacity key={option} accessibilityRole="radio" accessibilityLabel={option === "COMPRA" ? "Compra" : "Venta"} accessibilityState={{ selected: type === option }} onPress={() => setType(option)} style={styles.radioOption}><Text style={{ color: colors.text.primary, fontSize: 15 }}>{option === "COMPRA" ? "Compra" : "Venta"}</Text></TouchableOpacity>)}</View>
    <Text style={{ color: colors.text.primary, marginBottom: 4, fontSize: 15 }}>Monto de la operación</Text><TextInput accessibilityLabel="Monto de la operación" style={[styles.input, { borderColor: colors.border, color: colors.text.primary }]} placeholder="Monto" placeholderTextColor={colors.text.secondary} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
    {amountValidationError ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 13 }}>{amountValidationError}</Text> : null}
    <Text style={{ color: colors.text.primary, marginBottom: 4, fontSize: 15 }}>Moneda</Text>
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Moneda, ${selectedCurrency?.code ?? "Seleccionar"}`}
      accessibilityHint="Abre la lista de monedas disponibles"
      accessibilityState={{ expanded: isCurrencyPickerOpen }}
      onPress={() => setIsCurrencyPickerOpen((current) => !current)}
      style={[styles.currencyTrigger, { borderColor: colors.border }]}
    >
      <Text style={{ color: colors.text.primary }}>{selectedCurrency?.code ?? "Seleccionar moneda"}</Text>
      <Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ color: colors.text.secondary }}>{isCurrencyPickerOpen ? "▲" : "▼"}</Text>
    </TouchableOpacity>
    {isCurrencyPickerOpen ? <ScrollView
      testID="currency-options-scroll"
      accessibilityRole="radiogroup"
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      style={[styles.currencyMenu, { borderColor: colors.border, backgroundColor: colors.card }]}
    >
      {ratedCurrencies.map((item) => <TouchableOpacity
        key={item.id}
        accessibilityRole="radio"
        accessibilityLabel={item.code}
        accessibilityState={{ selected: item.id === selectedCurrencyId }}
        onPress={() => {
          setCurrencyId(item.id);
          if (worker && type === "VENTA" && workerCurrencyOptions.some((balance) => balance.currencyId === item.id)) {
            setWorkerCurrencyId(item.id);
          }
          setIsCurrencyPickerOpen(false);
        }}
        style={[styles.currencyOption, item.id === selectedCurrencyId && { backgroundColor: colors.primary[100] }]}
      ><Text style={{ color: colors.text.primary }}>{item.code}</Text></TouchableOpacity>)}
    </ScrollView> : null}
    <Text style={{ color: colors.text.primary, marginTop: 10, marginBottom: 4, fontSize: 15 }}>Tasa de cambio</Text>
    <TextInput accessibilityLabel="Tasa de cambio" style={[styles.input, { borderColor: colors.border, color: colors.text.primary }]} placeholder="Tasa" placeholderTextColor={colors.text.secondary} keyboardType="decimal-pad" value={rateInput} onChangeText={setRateInput} />
    <Text style={{ color: colors.text.secondary, fontSize: 13 }}>Tasa activa para {type === "COMPRA" ? "compra" : "venta"}: {activeRate || "—"} · Ingresada: {isRateValid ? rate : "—"}</Text>
    {rateValidationError ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 13 }}>{rateValidationError}</Text> : null}
    <TouchableOpacity accessibilityRole="checkbox" accessibilityLabel="Guardar como tasa actual" accessibilityState={{ checked: persistRate }} onPress={() => setPersistRate((current) => !current)} style={styles.checkboxRow}>
      <View style={[styles.checkbox, { borderColor: colors.primary[500], backgroundColor: persistRate ? colors.primary[500] : "transparent" }]}><Text style={{ color: colors.text.inverse, fontWeight: "bold", fontSize: 13 }}>{persistRate ? "✓" : ""}</Text></View>
      <Text style={{ color: colors.text.primary, fontSize: 14 }}>Guardar como tasa actual</Text>
    </TouchableOpacity>
    {currencyConfigurationError ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 8, fontSize: 13 }}>{currencyConfigurationError}</Text> : null}
     {worker ? <><Text style={{ color: colors.text.primary, marginTop: 8, marginBottom: 4, fontSize: 15 }}>Moneda del saldo del trabajador</Text>{workerCurrencyOptions.length > 0 ? <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 100 }} accessibilityRole="radiogroup">{workerCurrencyOptions.map((balance) => <TouchableOpacity key={balance.currencyId} accessibilityRole="radio" accessibilityLabel={`Saldo trabajador ${balance.currency?.code ?? balance.currencyId}`} accessibilityState={{ selected: balance.currencyId === workerCurrencyId }} onPress={() => { setWorkerCurrencyId(balance.currencyId); if (type === "VENTA") setCurrencyId(balance.currencyId); }} style={[styles.accountOption, { borderColor: colors.border }, balance.currencyId === workerCurrencyId && { borderColor: colors.primary[500] }]}><Text style={{ color: colors.text.primary, fontSize: 14 }}>{balance.currency?.code ?? `Moneda ${balance.currencyId}`}</Text><Text style={{ color: colors.text.secondary, fontSize: 13 }}>{Number(balance.balance).toFixed(2)}</Text></TouchableOpacity>)}</ScrollView> : <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 14 }}>{workerCurrencyValidationError}</Text>}</> : null}
    {renderAccountPicker("Origen", sourceOptions, sourceKey, setSourceKey)}{renderAccountPicker("Destino", destinationOptions, destinationKey, setDestinationKey)}
    {worker ? <><Text style={{ color: colors.text.primary, marginTop: 8, marginBottom: 4, fontSize: 15 }}>Ganancia del trabajador (opcional)</Text><TextInput accessibilityLabel="Ganancia del trabajador" style={[styles.input, { borderColor: colors.border, color: colors.text.primary }]} placeholder="Ganancia generada" placeholderTextColor={colors.text.secondary} keyboardType="decimal-pad" value={workerProfit} onChangeText={setWorkerProfit} />{workerProfitValidationError ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 13 }}>{workerProfitValidationError}</Text> : null}</> : null}
    <Text style={{ color: colors.text.secondary, fontSize: 14 }}>Estado actual: saldo {preview.currentSaldo?.toFixed(2) ?? "—"} · costo prom. {preview.currentCostoPromedio?.toFixed(2) ?? "—"}</Text>
    <Text style={{ color: colors.text.secondary, fontSize: 14 }}>Proyección: total {preview.totalBase.toFixed(2)} · saldo {preview.projectedSaldo?.toFixed(2) ?? "—"} · costo prom. {preview.projectedCostoPromedio?.toFixed(2) ?? "—"}</Text>
    {preview.expectedRendimiento !== null ? <Text accessibilityRole="text" style={{ color: colors.text.secondary, marginTop: 2, fontSize: 14 }}>Ganancia estimada: {preview.expectedRendimiento.toFixed(2)}</Text> : null}
    <Text accessibilityRole="summary" style={{ color: colors.text.secondary, marginTop: 8, fontSize: 14 }}>Resumen: salen {type === "COMPRA" ? preview.totalBase.toFixed(2) : amount || "0"} de {source?.label ?? "—"} y entran {type === "COMPRA" ? amount || "0" : preview.totalBase.toFixed(2)} en {destination?.label ?? "—"}</Text>
    {saveStatus === "success" ? <Text accessibilityRole="alert" style={{ color: colors.success, marginTop: 6, fontSize: 14 }}>Operación guardada correctamente.</Text> : null}{savedRateMessage ? <Text accessibilityRole="alert" style={{ color: colors.success, marginTop: 4, fontSize: 14 }}>{savedRateMessage}</Text> : null}{saveStatus === "error" ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 6, fontSize: 14 }}>{saveErrorMessage || "No se pudo guardar la operación. Intentá nuevamente."}</Text> : null}{amount && (!preview.isValid || !source || !destination || workerCurrencyValidationError) ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 6, fontSize: 14 }}>{workerCurrencyValidationError ?? (!preview.isValid ? preview.validationMessage : "Seleccioná origen y destino compatibles")}</Text> : null}
    <View style={styles.actions}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancelar" onPress={() => { setPersistRate(false); setOperationKind("TRANSFER"); setSavedRateMessage(undefined); setSaveStatus("idle"); setSaveErrorMessage(undefined); setAmount(""); setWorkerProfit(""); setRateInput(activeRate > 0 ? String(activeRate) : ""); onClose(); }} style={[styles.button, { backgroundColor: colors.border }]}><Text style={{ color: colors.text.primary, fontSize: 15 }}>Cancelar</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel={isPending ? "Guardando" : "Guardar"} onPress={handleSave} disabled={isPending || !canSubmit} style={[styles.button, { backgroundColor: colors.primary[500], opacity: isPending || !canSubmit ? 0.5 : 1 }]}><Text style={{ color: colors.text.inverse, fontSize: 15 }}>{isPending ? "Guardando..." : "Guardar"}</Text></TouchableOpacity></View>
  </ScrollView></View></Modal>;
};
const styles = StyleSheet.create({ overlay: { flex: 1, justifyContent: "flex-end" }, container: { maxHeight: "90%", borderTopLeftRadius: 16, borderTopRightRadius: 16, elevation: 5 }, containerContent: { padding: 16, paddingBottom: 4 }, dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(0,0,0,0.15)", alignSelf: "center", marginBottom: 8 }, title: { fontSize: 18, fontWeight: "bold", marginBottom: 14 }, input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8, minHeight: 44, fontSize: 15 }, typeRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 }, tabOption: { minHeight: 44, flex: 1, justifyContent: "center", alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" }, radioOption: { minHeight: 44, minWidth: 80, justifyContent: "center", alignItems: "center" }, checkboxRow: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8 }, checkbox: { width: 22, height: 22, borderWidth: 2, borderRadius: 4, alignItems: "center", justifyContent: "center" }, currencyTrigger: { minHeight: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, currencyMenu: { maxHeight: 180, borderWidth: 1, borderRadius: 8, marginTop: 4 }, currencyOption: { minHeight: 44, paddingHorizontal: 12, justifyContent: "center" }, accountOption: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 6, flexDirection: "row", justifyContent: "space-between" }, actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 14 }, button: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: "center", borderRadius: 8 } });
