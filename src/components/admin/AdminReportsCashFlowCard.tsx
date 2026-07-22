import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FadeInDown } from "../animations";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { DashboardPlatformBar } from "../../modules/admin/application/useAdminReportsDashboard";

type AdminReportsCashFlowCardProps = {
  totalLabel: string;
  deltaLabel: string;
  bars: DashboardPlatformBar[];
  isEmpty?: boolean;
  delay?: number;
};

export const AdminReportsCashFlowCard: React.FC<
  AdminReportsCashFlowCardProps
> = ({ totalLabel, deltaLabel, bars, isEmpty = false, delay = 90 }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const maxValue = Math.max(...bars.map((bar) => Math.abs(bar.value)), 1);

  return (
    <FadeInDown delay={delay} duration={260}>
      <View style={styles.card} testID="admin-reports-cashflow-card">
        <View style={styles.headerRow}>
          <Text style={styles.title}>Actividad de Plataforma</Text>
          <Text
            style={[
              styles.delta,
              { color: deltaLabel.startsWith("-") ? "#FF3F7D" : "#00D08C" },
            ]}
          >
            {deltaLabel}
          </Text>
        </View>

        <Text style={styles.total}>{totalLabel}</Text>

        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              Sin datos de flujo para este período
            </Text>
          </View>
        ) : (
          <View style={styles.chartArea}>
            <View style={styles.barsRow}>
              {bars.map((bar, index) => {
                const normalized = Math.max(
                  0.2,
                  Math.abs(bar.value) / maxValue,
                );
                return (
                  <View key={`${bar.label}-${index}`} style={styles.barColumn}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${normalized * 100}%`,
                          backgroundColor: bar.isActive
                            ? colors.info
                            : colors.primary[100],
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.barLabel,
                        bar.isActive && styles.barLabelActive,
                      ]}
                    >
                      {bar.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </FadeInDown>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    title: {
      color: colors.text.secondary,
      fontSize: 18,
      fontWeight: "500",
    },
    delta: {
      fontSize: 28,
      fontWeight: "800",
    },
    total: {
      color: colors.text.primary,
      fontWeight: "800",
      fontSize: 48,
      marginBottom: spacing.md,
    },
    chartArea: {
      height: 180,
      justifyContent: "flex-end",
      paddingTop: spacing.sm,
    },
    barsRow: {
      height: 150,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: spacing.xs,
    },
    barColumn: {
      flex: 1,
      alignItems: "center",
      height: "100%",
      justifyContent: "flex-end",
      gap: spacing.xs,
    },
    bar: {
      width: "100%",
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      minHeight: 24,
    },
    barLabel: {
      color: colors.text.secondary,
      fontSize: 15,
      fontWeight: "600",
      marginTop: spacing.xs,
    },
    barLabelActive: {
      color: "#1D8FFF",
    },
    emptyWrap: {
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: "#15385B",
      paddingVertical: spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      color: colors.text.secondary,
      fontSize: 14,
      fontWeight: "500",
    },
  });
