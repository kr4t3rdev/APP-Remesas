import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useColors } from "../../../store/themeStore";
import { useCashBalancesQuery } from "../../../modules/cash/application/useCash";
import { useOpenPositionMutation } from "../../../modules/transactions/application/useTransactions";
import { isPositionReviewable, type Position } from "../../../types/business";
import { parseDecimalInput } from "../../../utils/numberValidation";
import { useCurrenciesWithPrimaryQuery } from "../../../modules/currencies/application/useCurrencies";

type OpenPositionModalProps = {
  visible: boolean;
  positions: Position[];
  onClose: () => void;
};

export const OpenPositionModal = ({ visible, positions, onClose }: OpenPositionModalProps) => {
  const colors = useColors();
  const cashBalances = useCashBalancesQuery();
  const openPosition = useOpenPositionMutation();
  const currenciesWithPrimary = useCurrenciesWithPrimaryQuery();
  const [currencyId, setCurrencyId] = useState<number>();
  const [openingCost, setOpeningCost] = useState("");
  const [error, setError] = useState<string>();

  const candidates = useMemo(
    () => (cashBalances.data ?? []).filter((balance) => {
      const hasReviewedPosition = positions.some(
        (position) => position.currencyId === balance.currencyId && !isPositionReviewable(position),
      );
      return Number(balance.balance) > 0
        && balance.currencyId !== currenciesWithPrimary.data?.primaryCurrencyId
        && balance.currency?.isActive !== false
        && !hasReviewedPosition;
    }),
    [cashBalances.data, currenciesWithPrimary.data?.primaryCurrencyId, positions],
  );
  const selected = candidates.find((candidate) => candidate.currencyId === currencyId) ?? candidates[0];
  const isLoading = cashBalances.isLoading || currenciesWithPrimary.isLoading || currenciesWithPrimary.data?.primaryCurrencyId == null;
  const parsedOpeningCost = parseDecimalInput(openingCost, {
    min: 0.0001,
    max: 999999.9999,
    maxDecimalPlaces: 4,
  });

  useEffect(() => {
    if (!visible) return;
    setCurrencyId(candidates[0]?.currencyId);
    setOpeningCost("");
    setError(undefined);
  }, [candidates, visible]);

  const handleSubmit = async () => {
    if (!selected) {
      setError("No hay saldos históricos disponibles para abrir.");
      return;
    }
    if (parsedOpeningCost === null) {
      setError("Ingresá un costo inicial entre 0.0001 y 999999.9999, con hasta 4 decimales.");
      return;
    }

    setError(undefined);
    try {
      await openPosition.mutateAsync({ currencyId: selected.currencyId, openingCost: parsedOpeningCost });
      onClose();
    } catch {
      setError("No se pudo abrir la posición histórica. Revisá el saldo y el costo inicial.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" accessibilityViewIsModal>
      <View style={styles.overlay}>
        <ScrollView style={[styles.container, { backgroundColor: colors.card }]} contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>Abrir posición histórica</Text>
          <Text style={{ color: colors.text.secondary }}>
            Se usará el saldo actual de Caja como saldo inicial. Caja no se modifica.
          </Text>
          {isLoading ? (
            <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
              Cargando moneda principal y saldos...
            </Text>
          ) : candidates.length === 0 ? (
            <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 12 }}>
              No hay una moneda con saldo histórico pendiente de revisión.
            </Text>
          ) : (
            <>
              <Text style={[styles.label, { color: colors.text.primary }]}>Moneda</Text>
              <View accessibilityRole="radiogroup">
                {candidates.map((candidate) => (
                  <TouchableOpacity
                    key={candidate.currencyId}
                    accessibilityRole="radio"
                    accessibilityLabel={candidate.currency?.code ?? `Moneda ${candidate.currencyId}`}
                    accessibilityState={{ selected: candidate.currencyId === selected?.currencyId }}
                    onPress={() => setCurrencyId(candidate.currencyId)}
                    style={[styles.option, { borderColor: colors.border }, candidate.currencyId === selected?.currencyId && { borderColor: colors.primary[500] }]}
                  >
                    <Text style={{ color: colors.text.primary }}>
                      {candidate.currency?.symbol ? `${candidate.currency.symbol} ` : ""}{candidate.currency?.code ?? candidate.currencyId}
                    </Text>
                    <Text style={{ color: colors.text.secondary }}>{Number(candidate.balance).toFixed(2)} disponibles</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.label, { color: colors.text.primary }]}>Costo promedio inicial</Text>
              <TextInput
                accessibilityLabel="Costo promedio inicial"
                keyboardType="decimal-pad"
                value={openingCost}
                onChangeText={setOpeningCost}
                placeholder="Ej. 250.0000"
                placeholderTextColor={colors.text.secondary}
                style={[styles.input, { borderColor: colors.border, color: colors.text.primary }]}
              />
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                Este costo se usará para calcular ganancias futuras.
              </Text>
            </>
          )}
          {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 10 }}>{error}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancelar" onPress={onClose} style={[styles.button, { backgroundColor: colors.border }]}>
              <Text style={{ color: colors.text.primary }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={openPosition.isPending ? "Guardando" : "Abrir posición"} onPress={handleSubmit} disabled={openPosition.isPending || !selected} style={[styles.button, { backgroundColor: colors.primary[500], opacity: openPosition.isPending || !selected ? 0.5 : 1 }]}>
              <Text style={{ color: "#fff" }}>{openPosition.isPending ? "Guardando..." : "Abrir posición"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  container: { maxHeight: "85%", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  content: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  label: { fontSize: 15, marginTop: 16, marginBottom: 6 },
  option: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 6, flexDirection: "row", justifyContent: "space-between" },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 44, fontSize: 15 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 18 },
  button: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, justifyContent: "center" },
});
