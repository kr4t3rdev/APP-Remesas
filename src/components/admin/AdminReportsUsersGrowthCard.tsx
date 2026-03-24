import React, { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FadeInDown } from "../animations";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { DashboardGrowthPoint } from "../../modules/admin/application/useAdminReportsDashboard";

type AdminReportsUsersGrowthCardProps = {
  points: DashboardGrowthPoint[];
  peakLabel?: string;
  isEmpty?: boolean;
  onPressSeeAll?: () => void;
  delay?: number;
};

type PointCoordinates = {
  x: number;
  y: number;
  label: string;
};

function buildCoordinates(
  points: DashboardGrowthPoint[],
  width: number,
  height: number,
): PointCoordinates[] {
  if (!points.length || width <= 0) return [];

  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const horizontalPadding = 8;
  const drawableWidth = width - horizontalPadding * 2;

  return points.map((point, index) => {
    const x =
      horizontalPadding +
      (drawableWidth * index) / Math.max(points.length - 1, 1);
    const normalized = point.value / maxValue;
    const y = height - normalized * (height - 24) - 12;

    return { x, y, label: point.label };
  });
}

export const AdminReportsUsersGrowthCard: React.FC<
  AdminReportsUsersGrowthCardProps
> = ({ points, peakLabel, isEmpty = false, onPressSeeAll, delay = 120 }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [chartWidth, setChartWidth] = useState(0);
  const chartHeight = 190;

  const coordinates = useMemo(
    () => buildCoordinates(points, chartWidth, chartHeight - 44),
    [points, chartWidth],
  );

  const peakIndex = useMemo(() => {
    if (!coordinates.length || !peakLabel) return -1;
    const maxY = Math.min(...coordinates.map((point) => point.y));
    return coordinates.findIndex((point) => point.y === maxY);
  }, [coordinates, peakLabel]);

  const handleChartLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  return (
    <FadeInDown delay={delay} duration={280}>
      <View style={styles.card} testID="admin-reports-growth-card">
        <View style={styles.headerRow}>
          <Text style={styles.title}>Crecimiento de Usuarios</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ver todos los reportes de crecimiento"
            testID="admin-reports-growth-see-all"
            onPress={onPressSeeAll}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              Sin actividad de usuarios para este período
            </Text>
          </View>
        ) : (
          <View style={styles.chartWrap} onLayout={handleChartLayout}>
            <View style={styles.linesArea}>
              {coordinates.map((point, index) => {
                if (index === coordinates.length - 1) return null;

                const next = coordinates[index + 1];
                const dx = next.x - point.x;
                const dy = next.y - point.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                return (
                  <View
                    key={`line-${index}`}
                    style={[
                      styles.segment,
                      {
                        width: length,
                        left: point.x,
                        top: point.y,
                        transform: [{ rotateZ: `${angle}rad` }],
                      },
                    ]}
                  />
                );
              })}

              {coordinates.map((point, index) => (
                <View
                  key={`point-${index}`}
                  style={[
                    styles.point,
                    {
                      left: point.x - 5,
                      top: point.y - 5,
                      backgroundColor:
                        index === peakIndex ? "#4DB1FF" : "#1D8FFF",
                    },
                  ]}
                />
              ))}

              {!!peakLabel && peakIndex >= 0 && coordinates[peakIndex] ? (
                <View
                  style={[
                    styles.peakTag,
                    {
                      left: Math.max(8, coordinates[peakIndex].x - 4),
                      top: Math.max(8, coordinates[peakIndex].y - 42),
                    },
                  ]}
                >
                  <Text style={styles.peakText}>{peakLabel}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.labelsRow}>
              {points.map((point) => (
                <Text key={point.label} style={styles.labelText}>
                  {point.label}
                </Text>
              ))}
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
      minHeight: 240,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    title: {
      color: colors.text.primary,
      fontSize: 22,
      fontWeight: "700",
    },
    seeAllButton: {
      minHeight: 44,
      justifyContent: "center",
      paddingHorizontal: spacing.xs,
    },
    seeAllText: {
      color: "#1D8FFF",
      fontWeight: "700",
      fontSize: 18,
    },
    chartWrap: {
      borderRadius: borderRadius.lg,
      backgroundColor: "transparent",
      paddingTop: spacing.sm,
      minHeight: 240,
    },
    linesArea: {
      height: 190,
      position: "relative",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    segment: {
      position: "absolute",
      height: 2,
      backgroundColor: "#1D8FFF",
    },
    point: {
      position: "absolute",
      width: 10,
      height: 10,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: "#E4F2FF",
    },
    peakTag: {
      position: "absolute",
      minHeight: 30,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: "#1D8FFF",
      justifyContent: "center",
    },
    peakText: {
      color: "#EAF5FF",
      fontWeight: "700",
      fontSize: 13,
    },
    labelsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    labelText: {
      color: colors.text.secondary,
      fontSize: 13,
      fontWeight: "700",
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
      textAlign: "center",
    },
  });
