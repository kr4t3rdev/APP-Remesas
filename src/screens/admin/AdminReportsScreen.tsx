import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn, FadeInDown } from '../../components/animations';
import { TabSelector } from '../../components/admin/TabSelector';
import { DateFilter } from '../../components/admin/ReportsDateFilter';
import { PlanFilter } from '../../components/admin/ReportsPlanFilter';
import { ReportsKpiCard } from '../../components/admin/ReportsKpiCard';
import { ReportsUserList } from '../../components/admin/ReportsUserList';
import { ReportsBlockedList } from '../../components/admin/ReportsBlockedList';
import { ReportsAuditLogList } from '../../components/admin/ReportsAuditLogList';
import {
  useAdminKpisQuery,
  useAdminUsersQuery,
  useAdminBlockedUsersQuery,
  useAdminExpiringLicensesQuery,
  useAdminAuditLogsQuery,
} from '../../modules/admin/application/useAdminMetrics';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';

type ReportTabId = 'kpis' | 'users' | 'blocked' | 'audit';

type ReportFilters = {
  dateFrom?: string;
  dateTo?: string;
  planId?: number;
};

export const AdminReportsScreen: React.FC = () => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  // State
  const [activeTab, setActiveTab] = useState<ReportTabId>('kpis');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const kpisQuery = useAdminKpisQuery({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    planId: filters.planId,
  });
  const usersQuery = useAdminUsersQuery();
  const blockedUsersQuery = useAdminBlockedUsersQuery();
  const expiring7Query = useAdminExpiringLicensesQuery(7);
  const expiring30Query = useAdminExpiringLicensesQuery(30);
  const auditLogsQuery = useAdminAuditLogsQuery();

  // Derived data
  const kpis = kpisQuery.data;
  const users = usersQuery.data ?? [];
  const blockedUsers = blockedUsersQuery.data ?? [];
  const auditLogs = auditLogsQuery.data ?? [];

  const isLoading =
    kpisQuery.isLoading ||
    usersQuery.isLoading ||
    blockedUsersQuery.isLoading ||
    auditLogsQuery.isLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      kpisQuery.refetch(),
      usersQuery.refetch(),
      blockedUsersQuery.refetch(),
      auditLogsQuery.refetch(),
    ]);
    setIsRefreshing(false);
  };

  const updateFilter = <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasFilters = filters.dateFrom || filters.dateTo || filters.planId;

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'kpis':
        return hasFilters ? 'Filtrado por período y/o plan' : 'Analítica completa';
      case 'users':
        return `${users.length} usuarios registrados`;
      case 'blocked':
        return `${blockedUsers.length} usuarios bloqueados`;
      case 'audit':
        return `${auditLogs.length} acciones registradas`;
      default:
        return '';
    }
  };

  const renderKpisSection = () => (
    <View>
      {/* Filters */}
      <DateFilter
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onDateFromChange={(val) => updateFilter('dateFrom', val)}
        onDateToChange={(val) => updateFilter('dateTo', val)}
        delay={80}
      />
      <PlanFilter
        selectedPlanId={filters.planId}
        onPlanChange={(val) => updateFilter('planId', val)}
        delay={100}
      />

      {hasFilters && (
        <FadeInDown delay={120}>
          <View style={styles.clearFiltersRow}>
            <Text style={styles.filterActiveText}>Filtros activos</Text>
            <View style={styles.filterChips}>
              {filters.dateFrom && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>Desde: {filters.dateFrom}</Text>
                </View>
              )}
              {filters.dateTo && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>Hasta: {filters.dateTo}</Text>
                </View>
              )}
            </View>
            <View style={styles.filterActions}>
              {hasFilters && (
                <View style={styles.clearButton}>
                  <Text style={styles.clearButtonText} onPress={clearFilters}>
                    Limpiar
                  </Text>
                </View>
              )}
            </View>
          </View>
        </FadeInDown>
      )}

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <ReportsKpiCard
          title="MRR Estimado CUP"
          value={kpis?.mrrEstimateCup ?? 0}
          prefix=""
          suffix=" CUP"
          decimals={2}
          icon="cash"
          iconColor={colors.success}
          loading={kpisQuery.isLoading}
          delay={140}
        />
        <ReportsKpiCard
          title="ARPU Estimado CUP"
          value={kpis?.arpuEstimateCup ?? 0}
          prefix=""
          suffix=" CUP"
          decimals={2}
          icon="trending-up"
          iconColor={colors.primary[500]}
          loading={kpisQuery.isLoading}
          delay={190}
        />
        <ReportsKpiCard
          title="Revenue at Risk"
          value={kpis?.revenueAtRiskCup ?? 0}
          prefix=""
          suffix=" CUP"
          decimals={2}
          icon="warning"
          iconColor={colors.warning}
          loading={kpisQuery.isLoading}
          delay={240}
        />
        <ReportsKpiCard
          title="Churn (período)"
          value={kpis?.churnPeriod ?? 0}
          suffix=""
          icon="trending-down"
          iconColor={colors.danger}
          loading={kpisQuery.isLoading}
          delay={290}
        />
        <ReportsKpiCard
          title="Reactivados"
          value={kpis?.reactivatedPeriod ?? 0}
          suffix=""
          icon="refresh"
          iconColor={colors.success}
          loading={kpisQuery.isLoading}
          delay={340}
        />
        <ReportsKpiCard
          title="Total Usuarios"
          value={kpis?.totalUsers ?? 0}
          suffix=""
          icon="people"
          iconColor={colors.primary[500]}
          loading={kpisQuery.isLoading}
          delay={390}
        />
      </View>

      {/* Expiring Licenses */}
      <FadeInDown delay={440}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Licencias por vencer</Text>
          <View style={styles.expiringRow}>
            <View style={styles.expiringCard}>
              <Ionicons name="alarm" size={20} color={colors.danger} />
              <Text style={styles.expiringValue}>{expiring7Query.data?.length ?? 0}</Text>
              <Text style={styles.expiringLabel}>Próximos 7 días</Text>
            </View>
            <View style={styles.expiringCard}>
              <Ionicons name="calendar" size={20} color={colors.warning} />
              <Text style={styles.expiringValue}>{expiring30Query.data?.length ?? 0}</Text>
              <Text style={styles.expiringLabel}>Próximos 30 días</Text>
            </View>
          </View>
        </View>
      </FadeInDown>
    </View>
  );

  const renderUsersSection = () => (
    <ReportsUserList
      users={users}
      loading={usersQuery.isLoading}
      delay={120}
    />
  );

  const renderBlockedSection = () => (
    <ReportsBlockedList
      users={blockedUsers}
      loading={blockedUsersQuery.isLoading}
      delay={120}
    />
  );

  const renderAuditSection = () => (
    <ReportsAuditLogList
      logs={auditLogs}
      loading={auditLogsQuery.isLoading}
      delay={120}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Header */}
        <FadeIn>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Reportes Admin</Text>
              <Text style={styles.subtitle}>{getTabSubtitle()}</Text>
            </View>
            {isLoading && (
              <View style={styles.loadingIndicator}>
                <Ionicons name="sync" size={18} color={colors.primary[500]} />
              </View>
            )}
          </View>
        </FadeIn>

        {/* Tab Selector */}
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} delay={40} />

        {/* Content based on active tab */}
        {activeTab === 'kpis' && renderKpisSection()}
        {activeTab === 'users' && renderUsersSection()}
        {activeTab === 'blocked' && renderBlockedSection()}
        {activeTab === 'audit' && renderAuditSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>, shadows: ReturnType<typeof useShadows>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    title: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
    subtitle: { color: colors.text.secondary, marginTop: 4, fontSize: 13 },
    loadingIndicator: {
      padding: spacing.sm,
    },
    filterActiveText: {
      fontSize: 12,
      color: colors.primary[500],
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    filterChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    filterChip: {
      backgroundColor: `${colors.primary[500]}16`,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    filterChipText: {
      fontSize: 12,
      color: colors.primary[500],
      fontWeight: '500',
    },
    filterActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    clearFiltersRow: {
      marginBottom: spacing.md,
      padding: spacing.sm,
      backgroundColor: `${colors.primary[500]}10`,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: `${colors.primary[500]}30`,
    },
    clearButton: {
      paddingVertical: spacing.xs,
    },
    clearButtonText: {
      color: colors.danger,
      fontWeight: '600',
      fontSize: 13,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    section: {
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    expiringRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    expiringCard: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      gap: spacing.xs,
      ...shadows.sm,
    },
    expiringValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
    },
    expiringLabel: {
      fontSize: 12,
      color: colors.text.secondary,
    },
  });
