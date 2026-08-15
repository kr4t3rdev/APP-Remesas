import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LicenseDetail } from "../../../types/licenses";
import { useColors } from "../../../store/themeStore";
import { borderRadius } from "../../../theme";

interface LicenseSummaryCardProps {
  license: LicenseDetail;
}

export const LicenseSummaryCard: React.FC<LicenseSummaryCardProps> = ({
  license,
}) => {
  const colors = useColors();
  const progress = Math.min(1, license.usedUsers / license.maxUsers);
  const accent = colors.primary[500];
  const accentBg = `${accent}14`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: accent }]}>
          <Ionicons name="ribbon" size={24} color={colors.text.inverse} />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Licencia {license.planName}
            </Text>
            {license.planName.includes("Enterprise") && (
              <View style={[styles.proBadge, { backgroundColor: accentBg }]}>
                <Text style={[styles.proText, { color: accent }]}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {license.billingCycle} • ID: {license.licenseKey}
          </Text>
        </View>
      </View>

      <View style={styles.usageRow}>
        <Text style={[styles.usageLabel, { color: colors.text.secondary }]}>
          Cupos utilizados
        </Text>
        <Text style={styles.usageValue}>
          <Text style={[styles.used, { color: colors.text.primary }]}>
            {license.usedUsers}
          </Text>
          <Text style={[styles.total, { color: colors.text.secondary }]}>
            {" "}
            / {license.maxUsers}
          </Text>
        </Text>
      </View>

      <View style={[styles.progressBarBg, { backgroundColor: accentBg }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress * 100}%`, backgroundColor: accent },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: 8,
  },
  proText: {
    fontSize: 10,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  usageLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  usageValue: {
    fontSize: 16,
  },
  used: {
    fontWeight: "700",
    fontSize: 20,
  },
  total: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});