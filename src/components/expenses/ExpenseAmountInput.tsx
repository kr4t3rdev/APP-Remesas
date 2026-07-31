import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { spacing, borderRadius } from "../../theme";
import { useColors } from "../../store/themeStore";

type ExpenseAmountInputProps = {
  value: string;
  onChange: (value: string) => void;
  currencySymbol?: string;
  error?: string;
  label?: string;
};

export const ExpenseAmountInput: React.FC<ExpenseAmountInputProps> = ({
  value,
  onChange,
  currencySymbol = "$",
  error,
  label = "Monto",
}) => {
  const themeColors = useColors();

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.,]/g, "").replace(",", ".");
    const separatorIndex = cleaned.indexOf(".");
    if (separatorIndex === -1) {
      onChange(cleaned);
      return;
    }

    const integerPart = cleaned.slice(0, separatorIndex);
    const decimalPart = cleaned
      .slice(separatorIndex + 1)
      .replace(/\./g, "")
      .slice(0, 2);
    onChange(`${integerPart}.${decimalPart}`);
  };

  const formattedValue = value
    ? `${currencySymbol} ${Number(value).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "";

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: themeColors.text.primary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          { borderColor: error ? themeColors.danger : themeColors.border },
        ]}
      >
        <Text style={[styles.currency, { color: themeColors.text.secondary }]}>
          {currencySymbol}
        </Text>
        <TextInput
          testID="expense-amount-input"
          style={[styles.input, { color: themeColors.text.primary }]}
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={themeColors.text.tertiary}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: themeColors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 12,
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
