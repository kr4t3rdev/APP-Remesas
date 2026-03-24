import React, { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { FadeIn } from "../../components/animations";
import { AdminHeader } from "../../components/admin/layout/AdminHeader";
import { AdminReportsPeriodSegment } from "../../components/admin/AdminReportsPeriodSegment";
import { AdminReportsMetricTile } from "../../components/admin/AdminReportsMetricTile";
import { AdminReportsCashFlowCard } from "../../components/admin/AdminReportsCashFlowCard";
import { AdminReportsUsersGrowthCard } from "../../components/admin/AdminReportsUsersGrowthCard";
import { AdminReportsSystemUsageSection } from "../../components/admin/AdminReportsSystemUsageSection";
import {
  useAdminReportsDashboard,
  type DashboardSystemUsageRow,
} from "../../modules/admin/application/useAdminReportsDashboard";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import type { AdminTabParamList } from "../../navigation/types";

type AdminReportsNavigation = BottomTabNavigationProp<
  AdminTabParamList,
  "AdminReports"
>;

export const AdminReportsScreen: React.FC = () => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<AdminReportsNavigation>();

  const {
    period,
    setPeriod,
    metricTiles,
    cashFlow,
    usersGrowth,
    systemUsageRows,
    isRefreshing,
    refetchAll,
    hasPartialError,
  } = useAdminReportsDashboard();

  const handleSystemRowPress = (row: DashboardSystemUsageRow) => {
    if (row.id === "api") {
      navigation.navigate("AdminServices");
      return;
    }

    navigation.navigate("AdminProfile");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refetchAll()}
            tintColor={colors.primary[500]}
          />
        }
      >
        <FadeIn duration={260}>
          <AdminHeader title="Reportes" onRefresh={() => void refetchAll()} />
        </FadeIn>

        {hasPartialError ? (
          <View
            style={styles.warningRow}
            testID="admin-reports-partial-warning"
          >
            <Ionicons name="warning-outline" size={16} color={colors.warning} />
            <Text style={styles.warningText}>
              Datos parciales, algunos bloques muestran fallback.
            </Text>
          </View>
        ) : null}

        <AdminReportsPeriodSegment value={period} onChange={setPeriod} />

        <View style={styles.metricsRow}>
          {metricTiles.map((metric, index) => (
            <AdminReportsMetricTile
              key={metric.id}
              metric={metric}
              delay={60 + index * 40}
            />
          ))}
        </View>

        <AdminReportsCashFlowCard
          totalLabel={cashFlow.totalLabel}
          deltaLabel={cashFlow.deltaLabel}
          bars={cashFlow.bars}
          isEmpty={cashFlow.isEmpty}
        />

        <AdminReportsUsersGrowthCard
          points={usersGrowth.points}
          peakLabel={usersGrowth.peakLabel}
          isEmpty={usersGrowth.isEmpty}
          onPressSeeAll={() => navigation.navigate("AdminUsers")}
        />

        <AdminReportsSystemUsageSection
          rows={systemUsageRows}
          onRowPress={handleSystemRowPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    warningRow: {
      marginBottom: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: `${colors.warning}55`,
      backgroundColor: `${colors.warning}1A`,
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    warningText: {
      color: colors.text.secondary,
      fontSize: 12,
      fontWeight: "500",
      flex: 1,
    },
    metricsRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
  });
