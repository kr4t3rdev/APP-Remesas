import React, { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "../../store/themeStore";
import { spacing } from "../../theme";
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
> = ({ points, peakLabel, isEmpty = false, onPressSeeAll }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [chartWidth, setChartWidth] = useState(0);
  const chartHeight = 160;

  const coordinates = useMemo(
    () => buildCoordinates(points, chartWidth, chartHeight - 36),
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
    <View style={styles.card} testID="admin-reports-growth-card">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Crecimiento de Usuarios</Text>
        {!!onPressSeeAll ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ver todos los reportes de crecimiento"
            testID="admin-reports-growth-see-all"
            onPress={onPressSeeAll}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        ) : null}
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
                    left: point.x - 4,
                    top: point.y - 4,
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
                    top: Math.max(8, coordinates[peakIndex].y - 36),
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
      marginBottom: spacing.sm,
    },
    title: {
      color: colors.text.secondary,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
    },
    seeAllButton: {
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
    },
    seeAllText: {
      color: "#1D8FFF",
      fontWeight: "700",
      fontSize: 11,
      letterSpacing: 0.5,
    },
    chartWrap: {
      paddingTop: spacing.xs,
    },
    linesArea: {
      height: 124,
      position: "relative",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    segment: {
      position: "absolute",
      height: 1.5,
      backgroundColor: "#1D8FFF",
    },
    point: {
      position: "absolute",
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#E4F2FF",
    },
    peakTag: {
      position: "absolute",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: "#1D8FFF",
    },
    peakText: {
      color: "#EAF5FF",
      fontWeight: "700",
      fontSize: 10,
      letterSpacing: 0.5,
      fontVariant: ["tabular-nums"],
    },
    labelsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 6,
      paddingHorizontal: 2,
    },
    labelText: {
      color: colors.text.secondary,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
      fontVariant: ["tabular-nums"],
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
      textAlign: "center",
    },
  });
