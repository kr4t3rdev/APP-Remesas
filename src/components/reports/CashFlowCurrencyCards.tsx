import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CashFlowReport } from "../../types";
import { borderRadius, spacing } from "../../theme";

type Props = {
  currencies: CashFlowReport["currencies"];
  colors: {
    surface: string;
    text: { primary: string; secondary: string };
    success: string;
    danger: string;
  };
};

const formatAmount = (value: number) =>
  value.toLocaleString("es-CU", { minimumFractionDigits: 2 });

export const CashFlowCurrencyCards: React.FC<Props> = ({
  currencies,
  colors,
}) => (
  <View style={styles.list}>
    {currencies.map((bucket) => {
      const positive = bucket.balance >= 0;
      return (
        <View
          key={bucket.currency.code}
          style={[styles.card, { backgroundColor: colors.surface }]}
          testID={`cash-flow-${bucket.currency.code}`}
        >
          <View style={styles.heading}>
            <Text style={[styles.code, { color: colors.text.primary }]}>
              {bucket.currency.code}
            </Text>
            <Text
              style={[
                styles.balance,
                { color: positive ? colors.success : colors.danger },
              ]}
            >
              {positive ? "+" : "-"}
              {bucket.currency.symbol} {formatAmount(Math.abs(bucket.balance))}
            </Text>
          </View>
          <Text style={[styles.detail, { color: colors.success }]}>
            Entradas: {bucket.currency.symbol} {formatAmount(bucket.inflows.total)}
          </Text>
          <Text style={[styles.detail, { color: colors.danger }]}>
            Salidas: {bucket.currency.symbol} {formatAmount(bucket.outflows.total)}
          </Text>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: { padding: spacing.lg, borderRadius: borderRadius.lg, gap: spacing.sm },
  heading: { flexDirection: "row", alignItems: "center" },
  code: { flex: 1, fontSize: 18, fontWeight: "700" },
  balance: { fontSize: 20, fontWeight: "700" },
  detail: { fontSize: 14, fontWeight: "600" },
});
