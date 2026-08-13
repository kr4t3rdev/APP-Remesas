import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "../../store/themeStore";
import { spacing } from "../../theme";
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
> = ({ totalLabel, deltaLabel, bars, isEmpty = false }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const maxValue = Math.max(...bars.map((bar) => Math.abs(bar.value)), 1);

  return (
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
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      color: colors.text.secondary,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
    },
    delta: {
      fontSize: 13,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
      letterSpacing: 0.5,
    },
    total: {
      color: colors.text.primary,
      fontWeight: "800",
      fontSize: 26,
      fontVariant: ["tabular-nums"],
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    chartArea: {
      height: 140,
      justifyContent: "flex-end",
      paddingTop: spacing.xs,
    },
    barsRow: {
      height: 110,
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
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      minHeight: 16,
    },
    barLabel: {
      color: colors.text.secondary,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
      fontVariant: ["tabular-nums"],
    },
    barLabelActive: {
      color: "#1D8FFF",
    },
    emptyWrap: {
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      color: colors.text.secondary,
      fontSize: 12,
      fontWeight: "500",
    },
  });
