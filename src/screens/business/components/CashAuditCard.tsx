import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "../../../store/themeStore";

interface CashAudit {
  dateFormatted: string;
  expected: number;
  actual: number;
  status: "MATCHED" | "SHORTAGE" | "OVERAGE";
  auditorName: string;
}

interface Props {
  audit: CashAudit;
}

export const CashAuditCard = ({ audit }: Props) => {
  const colors = useColors();

  const isMatched = audit.status === "MATCHED";
  const isShortage = audit.status === "SHORTAGE";

  let badgeColor = "#10B981";
  let badgeBgColor = "#D1FAE5";
  let dotColor = "#10B981";

  if (isShortage) {
    badgeColor = "#EF4444";
    badgeBgColor = "#FEE2E2";
    dotColor = "#EF4444";
  } else if (audit.status === "OVERAGE") {
    badgeColor = "#F59E0B"; // yellow/orange
    badgeBgColor = "#FEF3C7";
    dotColor = "#F59E0B";
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.secondary }]}>
          ÚLTIMO ARQUEO
        </Text>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      </View>

      <View style={styles.dateContainer}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>
          Fecha del arqueo
        </Text>
        <Text style={[styles.dateText, { color: colors.text.primary }]}>
          {audit.dateFormatted}
        </Text>
      </View>

      <View style={styles.amountsRow}>
        <View style={styles.amountColumn}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>
            Esperado
          </Text>
          <Text style={[styles.amountText, { color: colors.text.primary }]}>
            $
            {audit.expected.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
        <View style={styles.amountColumn}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>
            Real
          </Text>
          <Text style={[styles.amountText, { color: dotColor }]}>
            $
            {audit.actual.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text
          style={[styles.differenceLabel, { color: colors.text.secondary }]}
        >
          Diferencia
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeBgColor }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {audit.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.auditorText, { color: colors.text.secondary }]}>
        Auditado por: {audit.auditorName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "700",
  },
  amountsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  amountColumn: {
    flex: 1,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "800",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB", // Ligeramente hardcodeado para la línea sutil
    paddingTop: 16,
    marginBottom: 16,
  },
  differenceLabel: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  auditorText: {
    fontSize: 11,
    fontStyle: "italic",
  },
});
