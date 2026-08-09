import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { useColors, useIsDark } from "../../../store/themeStore";

export type CashAdjustmentAction = "AUDIT" | "ADJUSTMENT";
export type CashAdjustmentType = "INGRESO" | "EGRESO";

interface CurrencyOption {
  id: number;
  code: string;
}

interface Props {
  visible: boolean;
  action: CashAdjustmentAction;
  currencies: CurrencyOption[];
  selectedCurrencyId: number | null;
  onSelectCurrency: (id: number) => void;
  amount: string;
  onChangeAmount: (value: string) => void;
  notes: string;
  onChangeNotes: (value: string) => void;
  reason: string;
  onChangeReason: (value: string) => void;
  adjustmentType: CashAdjustmentType;
  onChangeAdjustmentType: (value: CashAdjustmentType) => void;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
}

export const CashAdjustmentSheet: React.FC<Props> = ({
  visible,
  action,
  currencies,
  selectedCurrencyId,
  onSelectCurrency,
  amount,
  onChangeAmount,
  notes,
  onChangeNotes,
  reason,
  onChangeReason,
  adjustmentType,
  onChangeAdjustmentType,
  isSaving,
  onSave,
  onClose,
}) => {
  const colors = useColors();
  const isDark = useIsDark();
  const isAudit = action === "AUDIT";

  return (
    <Modal visible={visible} transparent animationType="slide" accessibilityViewIsModal onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={[styles.modalCard, { backgroundColor: colors.card }]} contentContainerStyle={styles.modalCardContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{isAudit ? "Registrar arqueo" : "Registrar ajuste"}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Cerrar" hitSlop={12} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Moneda</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.currencyOptions}>
            {currencies.map((currency) => {
              const selected = selectedCurrencyId === currency.id;
              return (
                <TouchableOpacity
                  key={currency.id}
                  onPress={() => onSelectCurrency(currency.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[styles.currencyOption, { borderColor: selected ? colors.primary[500] : colors.border, backgroundColor: selected ? (isDark ? `${colors.primary[500]}25` : colors.primary[50]) : colors.card }]}
                >
                  <Text style={[styles.optionText, { color: selected ? colors.primary[500] : colors.text.secondary }]}>{currency.code}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Input label={isAudit ? "Saldo real" : "Monto"} value={amount} onChangeText={onChangeAmount} keyboardType="decimal-pad" placeholder="0.00" />

          {isAudit ? (
            <Input label="Notas (opcional)" value={notes} onChangeText={onChangeNotes} placeholder="Observaciones" multiline numberOfLines={3} />
          ) : (
            <>
              <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Tipo</Text>
              <View style={styles.typeRow}>
                {(["INGRESO", "EGRESO"] as CashAdjustmentType[]).map((type) => {
                  const selected = adjustmentType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => onChangeAdjustmentType(type)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[styles.typeOption, { borderColor: selected ? colors.primary[500] : colors.border, backgroundColor: selected ? colors.primary[50] : colors.card }]}
                    >
                      <Text style={[styles.optionText, { color: selected ? colors.primary[500] : colors.text.secondary }]}>{type === "INGRESO" ? "Ingreso" : "Egreso"}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Input label="Motivo" value={reason} onChangeText={onChangeReason} placeholder="Motivo del ajuste" />
            </>
          )}

          <Button
            title={isAudit ? "Guardar arqueo" : "Guardar ajuste"}
            onPress={onSave}
            loading={isSaving}
            disabled={selectedCurrencyId === null}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalCard: { maxHeight: "90%", borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  modalCardContent: { padding: 20, gap: 12, paddingBottom: 28 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  closeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  fieldLabel: { fontSize: 14, fontWeight: "600" },
  currencyOptions: { gap: 8, paddingBottom: 4 },
  currencyOption: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  optionText: { fontWeight: "700" },
  typeRow: { flexDirection: "row", gap: 8 },
  typeOption: { flex: 1, minHeight: 44, justifyContent: "center", borderWidth: 1, borderRadius: 10, alignItems: "center", paddingVertical: 11 },
});
