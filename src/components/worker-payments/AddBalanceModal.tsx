import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../animations";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import { useBankAccountsQuery } from "../../modules/bank-accounts/application/useBankAccounts";
import { useCashBalancesQuery } from "../../modules/cash/application/useCash";
import { useCurrenciesQuery } from "../../modules/currencies/application/useCurrencies";
import type { Worker } from "../../types";
import { parseDecimalInput } from "../../utils/numberValidation";

type AccountOption = {
  key: string;
  type: "CASH" | "BANK_ACCOUNT";
  id?: number;
  label: string;
  currencyId?: number;
  balance: number;
};

type AddBalanceModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    sourceType?: "CASH" | "BANK_ACCOUNT";
    sourceId?: number;
    destinationType?: "CASH" | "BANK_ACCOUNT";
    destinationId?: number;
    currencyId?: number;
  }) => Promise<void>;
  worker: Worker | null;
  isLoading?: boolean;
  mode?: "add" | "deposit";
};

export const AddBalanceModal: React.FC<AddBalanceModalProps> = ({
  visible,
  onClose,
  onSubmit,
  worker,
  isLoading = false,
  mode = "add",
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const { data: banks = [] } = useBankAccountsQuery();
  const { data: cashBalances = [] } = useCashBalancesQuery();
  const { data: currencies = [] } = useCurrenciesQuery();

  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAccountKey, setSelectedAccountKey] = useState<string | null>(null);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(null);
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);

  const isDeposit = mode === "deposit";

  useEffect(() => {
    if (visible) {
      setAmount("");
      setErrors({});
      setSelectedAccountKey(null);
      setSelectedCurrencyId(null);
      setIsCurrencyPickerOpen(false);
    }
  }, [visible]);

  const accounts = useMemo<AccountOption[]>(() => {
    const cashByCurrencyId = new Map(
      cashBalances.map((item) => [item.currencyId, item]),
    );
    // Solo mostrar cajas que existan realmente en el backend. Si mostramos una
    // caja "fantasma" (sin registro), el backend la rechaza con "Caja no
    // encontrada" aunque el usuario la vea en la lista.
    const cashAccounts = currencies
      .filter((c) => c.isActive !== false)
      .filter((currency) => cashByCurrencyId.has(currency.id))
      .map((currency) => {
        const cashBalance = cashByCurrencyId.get(currency.id)!;
        return {
          key: `CASH:${currency.id}`,
          type: "CASH" as const,
          label: `Caja · ${currency.code}`,
          currencyId: currency.id,
          balance: Number(cashBalance.balance) || 0,
        };
      });
    const bankAccounts = banks
      .filter((b) => b.isActive)
      .map((b) => ({
        key: `BANK_ACCOUNT:${b.id}`,
        type: "BANK_ACCOUNT" as const,
        id: b.id,
        label: `${b.bankName} · ${b.name}`,
        currencyId: b.currencyId,
        balance: Number(b.balance) || 0,
      }));
    return [...cashAccounts, ...bankAccounts];
  }, [cashBalances, banks, currencies]);

  const uniqueCurrencies = useMemo(() => {
    return currencies.filter((c) => c.isActive !== false);
  }, [currencies]);

  useEffect(() => {
    if (visible && uniqueCurrencies.length > 0 && !selectedCurrencyId) {
      setSelectedCurrencyId(uniqueCurrencies[0].id);
    }
  }, [visible, uniqueCurrencies, selectedCurrencyId]);

  const filteredAccounts = useMemo(
    () =>
      selectedCurrencyId
        ? accounts.filter((a) => a.currencyId === selectedCurrencyId)
        : [],
    [accounts, selectedCurrencyId],
  );

  useEffect(() => {
    if (visible && filteredAccounts.length > 0) {
      const stillExists = filteredAccounts.some(
        (a) => a.key === selectedAccountKey,
      );
      if (!stillExists) {
        setSelectedAccountKey(filteredAccounts[0].key);
      }
    }
  }, [visible, filteredAccounts, selectedAccountKey]);

  const selectedAccount = filteredAccounts.find(
    (a) => a.key === selectedAccountKey,
  );

  const selectedCurrency = currencies.find(
    (c) => c.id === selectedCurrencyId,
  );
  const workerBalance = selectedCurrencyId
    ? worker?.balances?.find((balance) => balance.currencyId === selectedCurrencyId)
    : undefined;
  const currentWorkerBalance = Number(workerBalance?.balance ?? 0);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const numAmount = parseDecimalInput(amount, { min: 0.01, maxDecimalPlaces: 2 });

    if (numAmount === null) {
      newErrors.amount = "Ingresá un monto válido de hasta 2 decimales";
    }

    if (!selectedAccountKey) {
      newErrors.account = isDeposit
        ? "Seleccioná un destino"
        : "Seleccioná un origen";
    }

    if (isDeposit && worker && numAmount !== null && numAmount > currentWorkerBalance) {
      newErrors.amount = "El monto supera el saldo disponible del trabajador";
    }

    // En modo "add" (entregar al trabajador) el origen debe tener saldo
    // suficiente. El backend rechaza esto con "Saldo insuficiente en caja" o
    // "Saldo insuficiente en la cuenta bancaria" — mejor validar acá y dar
    // feedback inmediato al usuario.
    if (!isDeposit && selectedAccount && numAmount !== null && numAmount > Number(selectedAccount.balance)) {
      newErrors.amount = `El monto supera el saldo disponible del origen ($${selectedAccount.balance.toLocaleString()})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const normalizedAmount = parseDecimalInput(amount, { min: 0.01, maxDecimalPlaces: 2 });
    if (normalizedAmount === null) return;

    setIsSubmitting(true);
    try {
      const account = filteredAccounts.find(
        (a) => a.key === selectedAccountKey,
      );
      await onSubmit({
        amount: normalizedAmount,
        ...(isDeposit
          ? {
              destinationType: account?.type as "CASH" | "BANK_ACCOUNT",
              destinationId: account?.id,
              currencyId: selectedCurrencyId as number,
            }
          : {
              sourceType: account?.type as "CASH" | "BANK_ACCOUNT",
              sourceId: account?.id,
              currencyId: selectedCurrencyId as number,
            }),
      });
      onClose();
    } catch {
      // El error ya fue notificado por la screen con el mensaje real del backend.
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewAmount = parseDecimalInput(amount, { min: 0, maxDecimalPlaces: 2 }) ?? 0;
  const newBalance = isDeposit
    ? (worker ? currentWorkerBalance - previewAmount : 0)
    : (worker ? currentWorkerBalance + previewAmount : 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FadeInDown>
          <View
            style={[
              styles.container,
              { backgroundColor: themeColors.card },
              themeShadows.lg,
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: themeColors.text.primary }]}>
                {isDeposit ? "Depositar Saldo" : "Agregar Saldo"}
              </Text>
              <TouchableOpacity
                testID="close-balance-modal"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={themeColors.text.primary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {worker && (
                <View
                  style={[
                    styles.workerInfo,
                    { backgroundColor: themeColors.background },
                  ]}
                >
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: themeColors.primary[500] },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        { color: themeColors.text.inverse },
                      ]}
                    >
                      {worker.initials}
                    </Text>
                  </View>
                  <View style={styles.workerDetails}>
                    <Text
                      style={[
                        styles.workerName,
                        { color: themeColors.text.primary },
                      ]}
                    >
                      {worker.name}
                    </Text>
                    <Text
                      style={[
                        styles.workerBalance,
                        { color: themeColors.text.secondary },
                      ]}
                    >
                      Saldo actual (${selectedCurrency?.code ?? ""}): ${currentWorkerBalance.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={[styles.sectionLabel, { color: themeColors.text.secondary }]}>
                MONEDA
              </Text>
              <TouchableOpacity
                onPress={() => setIsCurrencyPickerOpen((c) => !c)}
                style={[styles.pickerTrigger, { borderColor: themeColors.border }]}
              >
                <Text style={{ color: themeColors.text.primary }}>
                  {selectedCurrency?.code ?? "Seleccionar moneda"}
                </Text>
                <Text style={{ color: themeColors.text.secondary }}>
                  {isCurrencyPickerOpen ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
              {isCurrencyPickerOpen && (
                <ScrollView
                  nestedScrollEnabled
                  style={[styles.pickerMenu, { borderColor: themeColors.border, backgroundColor: themeColors.card }]}
                >
                  {uniqueCurrencies.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => {
                        setSelectedCurrencyId(c.id);
                        setIsCurrencyPickerOpen(false);
                      }}
                      style={[
                        styles.pickerOption,
                        c.id === selectedCurrencyId && { backgroundColor: themeColors.primary[100] },
                      ]}
                    >
                      <Text style={{ color: themeColors.text.primary }}>{c.code}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Input
                testID="balance-amount-input"
                label={isDeposit ? "Monto a depositar" : "Monto a entregar"}
                value={amount}
                onChangeText={setAmount}
                placeholder="Ej: 500"
                keyboardType="numeric"
                error={errors.amount}
              />

              <Text style={[styles.sectionLabel, { color: themeColors.text.secondary }]}>
                {isDeposit ? "DESTINO" : "ORIGEN"}
              </Text>
              {filteredAccounts.length === 0 ? (
                <Text style={[styles.emptyAccounts, { color: themeColors.danger }]}>
                  {isDeposit
                    ? "No hay cuentas disponibles para depositar"
                    : "No hay cuentas disponibles para esta moneda"}
                </Text>
              ) : (
                filteredAccounts.map((account) => {
                  const isSelected = account.key === selectedAccountKey;
                  return (
                    <TouchableOpacity
                      key={account.key}
                      onPress={() => setSelectedAccountKey(account.key)}
                      style={[
                        styles.accountOption,
                        { borderColor: isSelected ? themeColors.primary[500] : themeColors.border },
                      ]}
                    >
                      <View style={styles.accountInfo}>
                        <Ionicons
                          name={account.type === "CASH" ? "wallet-outline" : "business-outline"}
                          size={18}
                          color={isSelected ? themeColors.primary[500] : themeColors.text.secondary}
                        />
                        <Text
                          style={[
                            styles.accountLabel,
                            { color: isSelected ? themeColors.primary[500] : themeColors.text.primary },
                          ]}
                        >
                          {account.label}
                        </Text>
                      </View>
                      <Text style={{ color: themeColors.text.secondary, fontSize: 13 }}>
                        ${Number(account.balance).toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}

              {errors.account && (
                <Text style={[styles.errorText, { color: themeColors.danger }]}>
                  {errors.account}
                </Text>
              )}

              <View
                style={[
                  styles.previewSection,
                  { backgroundColor: themeColors.background },
                ]}
              >
                <View style={styles.previewRow}>
                  <Text
                    style={[
                      styles.previewText,
                      { color: themeColors.text.secondary },
                    ]}
                  >
                    Nuevo saldo:
                  </Text>
                  <Text
                    style={[
                      styles.previewValue,
                      { color: newBalance < 0 ? themeColors.danger : themeColors.success },
                    ]}
                  >
                    ${newBalance.toLocaleString()}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                testID="balance-cancel-button"
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1 }}
              />
              <Button
                testID="balance-submit-button"
                title={isDeposit ? "Depositar" : "Agregar"}
                onPress={handleSubmit}
                loading={isSubmitting || isLoading}
                disabled={isSubmitting || isLoading}
                style={{ flex: 1, backgroundColor: isDeposit ? "#F59E0B" : "#10B981" }}
              />
            </View>
          </View>
        </FadeInDown>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    maxHeight: 500,
  },
  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  workerBalance: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  pickerTrigger: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  pickerMenu: {
    maxHeight: 160,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  pickerOption: {
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  accountOption: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  accountLabel: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  emptyAccounts: {
    fontSize: 13,
    textAlign: "center",
    marginVertical: spacing.md,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  previewSection: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewText: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
