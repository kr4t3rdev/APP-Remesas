import React from "react";
import { View, Text } from "react-native";
import { Card } from "../../ui/Card";
import { colors, spacing, borderRadius } from "../../../theme";
import type { DailyReport } from "../../../types";

type TransactionSummaryCardProps = {
  report: DailyReport;
};

export const TransactionSummaryCard: React.FC<TransactionSummaryCardProps> = ({
  report,
}) => {
  return (
    <Card title="Resumen del Día">
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.primary[50],
            borderRadius: borderRadius.md,
            padding: spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.text.secondary,
              marginBottom: 4,
            }}
          >
            Compras
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.primary[700],
            }}
          >
            {report.transactions.compras}
          </Text>
          <Text
            style={{ fontSize: 12, color: colors.text.secondary, marginTop: 4 }}
          >
            $ {report.transactions.totalCompras.toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: colors.success + "15",
            borderRadius: borderRadius.md,
            padding: spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.text.secondary,
              marginBottom: 4,
            }}
          >
            Ventas
          </Text>
          <Text
            style={{ fontSize: 20, fontWeight: "700", color: colors.success }}
          >
            {report.transactions.ventas}
          </Text>
          <Text
            style={{ fontSize: 12, color: colors.text.secondary, marginTop: 4 }}
          >
            $ {report.transactions.totalVentas.toLocaleString()}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: spacing.md,
          paddingTop: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.separator,
        }}
      >
        <View>
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>
            Margen
          </Text>
          <Text
            style={{ fontSize: 16, fontWeight: "600", color: colors.success }}
          >
            {report.profit.margin.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}%
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>
            Neto
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text.primary,
            }}
          >
            $ {Number(report.profit.net ?? 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </Card>
  );
};
