import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";

export type TransactionFilterValue = "all" | "COMPRA" | "VENTA";

export const TRANSACTION_FILTER_OPTIONS: {
  key: TransactionFilterValue;
  label: string;
}[] = [
  { key: "all", label: "Todas" },
  { key: "COMPRA", label: "Compras" },
  { key: "VENTA", label: "Ventas" },
];

export function getTransactionFilterLabel(
  value: TransactionFilterValue,
): string {
  return (
    TRANSACTION_FILTER_OPTIONS.find((f) => f.key === value)?.label ?? "Todas"
  );
}

type Props = {
  visible: boolean;
  value: TransactionFilterValue;
  onSelect: (value: TransactionFilterValue) => void;
  onClose: () => void;
};

export const TransactionFilterModal: React.FC<Props> = ({
  visible,
  value,
  onSelect,
  onClose,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.root}>
        <TouchableOpacity
          style={styles.backdropFlex}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          accessibilityRole="summary"
          accessibilityLabel="Filtros de transacciones"
          style={[
            styles.sheet,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
            themeShadows.lg,
          ]}
        >
          <Text style={[styles.title, { color: themeColors.text.primary }]}>
            Filtrar transacciones
          </Text>
          {TRANSACTION_FILTER_OPTIONS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => onSelect(f.key)}
              style={[
                styles.option,
                { borderColor: themeColors.border },
                value === f.key && {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.primary[300],
                },
              ]}
              accessibilityRole="radio"
              accessibilityLabel={f.label}
              accessibilityState={{ selected: value === f.key }}
            >
              <Text
                style={[styles.optionText, { color: themeColors.text.primary }]}
              >
                {f.label}
              </Text>
              {value === f.key ? (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={themeColors.primary[500]}
                />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  backdropFlex: {
    flex: 1,
  },
  sheet: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    maxWidth: "100%",
    borderWidth: 1,
    overflow: "hidden",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 48,
    marginBottom: spacing.xs,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
