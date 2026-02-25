import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn, FadeInDown, ScaleIn } from '../../components/animations';
import { BarChart, HorizontalBarChart, StatsCard } from '../../components/charts/Charts';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { format, subDays } from 'date-fns';
import {
  useReportsCashBalancesQuery,
  useReportsDailyReportQuery,
} from '../../modules/reports/application/useReports';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ReportType = 'daily' | 'period' | 'profit' | 'cash-flow';

export const ReportsScreen: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodStart, setPeriodStart] = useState(subDays(new Date(), 7));
  const [periodEnd, setPeriodEnd] = useState(new Date());

  const dailyReportQuery = useReportsDailyReportQuery(selectedDate);
  const cashBalancesQuery = useReportsCashBalancesQuery();
  const dailyReport = dailyReportQuery.data;
  const cashBalances = cashBalancesQuery.data ?? [];

  const handleRefresh = async () => {
    await Promise.all([dailyReportQuery.refetch(), cashBalancesQuery.refetch()]);
  };

  const formatNumber = (value: number | string) => {
    const num = Number(value) || 0;
    return num.toLocaleString('es-CU', { minimumFractionDigits: 2 });
  };

  const reports = [
    {
      id: 'daily' as ReportType,
      title: 'Diario',
      description: 'Resumen del día',
      icon: 'today' as const,
      color: colors.primary[500],
    },
    {
      id: 'period' as ReportType,
      title: 'Por Período',
      description: 'Análisis entre fechas',
      icon: 'calendar' as const,
      color: colors.success,
    },
    {
      id: 'profit' as ReportType,
      title: 'Ganancias',
      description: 'Margen de utilidades',
      icon: 'trending-up' as const,
      color: colors.warning,
    },
    {
      id: 'cash-flow' as ReportType,
      title: 'Flujo de Caja',
      description: 'Entradas y salidas',
      icon: 'swap-vertical' as const,
      color: colors.secondary[500],
    },
  ];

  const transactionChartData = dailyReport ? [
    { label: 'Compras', value: dailyReport.transactions.compras, color: colors.financial.compra },
    { label: 'Ventas', value: dailyReport.transactions.ventas, color: colors.financial.venta },
  ] : [];

  const expenseCategoryData = dailyReport?.expenses.byCategory 
    ? Object.entries(dailyReport.expenses.byCategory).map(([category, data]) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: data.total,
        color: colors.dashboard.categories[category as keyof typeof colors.dashboard.categories]?.icon || colors.text.secondary,
      }))
    : [];

  const balanceChartData = cashBalances.slice(0, 4).map(b => ({
    label: b.currency?.code || '',
    value: Math.abs(Number(b.balance)),
    color: b.currency?.code === 'USD' ? colors.currencies.usd.primary : 
           b.currency?.code === 'EUR' ? colors.currencies.eur.primary :
           b.currency?.code === 'MLC' ? colors.currencies.mlc.primary : colors.primary[500],
  }));

  const renderDailyReport = () => {
    if (!dailyReport) return null;

    return (
      <>
        <View style={styles.statsGrid}>
          <ScaleIn delay={100}>
            <StatsCard
              title="Ganancia Neta"
              value={`$ ${formatNumber(dailyReport.profit.net)}`}
              icon={<Ionicons name="trending-up" size={20} color={colors.success} />}
              color={colors.success}
              trend={dailyReport.profit.net > 0 ? 'up' : dailyReport.profit.net < 0 ? 'down' : 'neutral'}
              style={styles.statCard}
            />
          </ScaleIn>
          <ScaleIn delay={150}>
            <StatsCard
              title="Transacciones"
              value={dailyReport.transactions.total.toString()}
              subtitle={`${dailyReport.transactions.compras} compras, ${dailyReport.transactions.ventas} ventas`}
              icon={<Ionicons name="swap-horizontal" size={20} color={colors.primary[500]} />}
              color={colors.primary[500]}
              style={styles.statCard}
            />
          </ScaleIn>
        </View>

        <View style={styles.statsGrid}>
          <ScaleIn delay={200}>
            <StatsCard
              title="Total Compras"
              value={`$ ${formatNumber(dailyReport.transactions.totalCompras)}`}
              icon={<Ionicons name="arrow-down-circle" size={20} color={colors.financial.compra} />}
              color={colors.financial.compra}
              style={styles.statCard}
            />
          </ScaleIn>
          <ScaleIn delay={250}>
            <StatsCard
              title="Total Ventas"
              value={`$ ${formatNumber(dailyReport.transactions.totalVentas)}`}
              icon={<Ionicons name="arrow-up-circle" size={20} color={colors.financial.venta} />}
              color={colors.financial.venta}
              style={styles.statCard}
            />
          </ScaleIn>
        </View>

        <FadeInDown delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compras vs Ventas</Text>
            <View style={styles.chartCard}>
              <BarChart
                data={transactionChartData}
                height={100}
                showLabels
                showValues
                maxValue={Math.max(dailyReport.transactions.compras, dailyReport.transactions.ventas, 5)}
              />
            </View>
          </View>
        </FadeInDown>

        <FadeInDown delay={350}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gastos</Text>
            <View style={styles.statsRow}>
              <View style={styles.expenseStat}>
                <Text style={styles.expenseLabel}>Total Gastos</Text>
                <Text style={styles.expenseValue}>$ {formatNumber(dailyReport.expenses.totalAmount)}</Text>
              </View>
              <View style={styles.expenseStat}>
                <Text style={styles.expenseLabel}>Cantidad</Text>
                <Text style={styles.expenseValue}>{dailyReport.expenses.total}</Text>
              </View>
            </View>
            {expenseCategoryData.length > 0 && (
              <View style={[styles.chartCard, { marginTop: spacing.md }]}>
                <HorizontalBarChart
                  data={expenseCategoryData}
                  maxValue={Math.max(...expenseCategoryData.map(d => d.value), 100)}
                />
              </View>
            )}
          </View>
        </FadeInDown>
      </>
    );
  };

  const renderPeriodReport = () => (
    <FadeInDown>
      <View style={styles.section}>
        <View style={styles.dateRangeCard}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Desde</Text>
            <TouchableOpacity style={styles.dateButton}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary[500]} />
              <Text style={styles.dateText}>
                {format(periodStart, 'dd/MM/yyyy')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Hasta</Text>
            <TouchableOpacity style={styles.dateButton}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary[500]} />
              <Text style={styles.dateText}>
                {format(periodEnd, 'dd/MM/yyyy')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Selecciona un período</Text>
            <Text style={styles.emptySubtitle}>
              Elige las fechas para ver el análisis
            </Text>
          </View>
        </View>
      </View>
    </FadeInDown>
  );

  const renderProfitReport = () => (
    <>
      <FadeInDown delay={100}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Margen de Ganancias</Text>
          <View style={styles.chartCard}>
            <View style={styles.emptyState}>
              <Ionicons name="trending-up-outline" size={48} color={colors.success} />
              <Text style={styles.profitValue}>
                {dailyReport ? `$ ${formatNumber(dailyReport.profit.margin)}` : '$ 0.00'}
              </Text>
              <Text style={styles.emptySubtitle}>
                Margen acumulado del período
              </Text>
            </View>
          </View>
        </View>
      </FadeInDown>

      <FadeInDown delay={150}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribución de Saldos</Text>
          <View style={styles.chartCard}>
            {balanceChartData.length > 0 ? (
              <BarChart
                data={balanceChartData}
                height={100}
                showLabels
                showValues
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptySubtitle}>No hay datos de saldo</Text>
              </View>
            )}
          </View>
        </View>
      </FadeInDown>
    </>
  );

  const renderCashFlowReport = () => (
    <FadeInDown>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flujo de Caja</Text>
        <View style={styles.chartCard}>
          <View style={styles.flowRow}>
            <View style={styles.flowItem}>
              <View style={[styles.flowIcon, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="arrow-down" size={24} color={colors.success} />
              </View>
              <Text style={styles.flowLabel}>Entradas</Text>
              <Text style={[styles.flowValue, { color: colors.success }]}>
                {dailyReport ? `$ ${formatNumber(dailyReport.transactions.totalVentas)}` : '$ 0.00'}
              </Text>
            </View>
            <View style={styles.flowDivider} />
            <View style={styles.flowItem}>
              <View style={[styles.flowIcon, { backgroundColor: `${colors.danger}15` }]}>
                <Ionicons name="arrow-up" size={24} color={colors.danger} />
              </View>
              <Text style={styles.flowLabel}>Salidas</Text>
              <Text style={[styles.flowValue, { color: colors.danger }]}>
                {dailyReport ? `$ ${formatNumber(dailyReport.transactions.totalCompras + dailyReport.expenses.totalAmount)}` : '$ 0.00'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </FadeInDown>
  );

  const renderContent = () => {
    switch (selectedReport) {
      case 'daily':
        return renderDailyReport();
      case 'period':
        return renderPeriodReport();
      case 'profit':
        return renderProfitReport();
      case 'cash-flow':
        return renderCashFlowReport();
      default:
        return renderDailyReport();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={dailyReportQuery.isRefetching || cashBalancesQuery.isRefetching} 
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        <FadeIn>
          <View style={styles.header}>
            <Text style={styles.title}>Reportes</Text>
            <Text style={styles.subtitle}>Análisis y estadísticas</Text>
          </View>
        </FadeIn>

        <View style={styles.reportsGrid}>
          {reports.map((report, index) => (
            <ScaleIn key={report.id} delay={index * 50}>
              <TouchableOpacity
                style={[
                  styles.reportCard,
                  selectedReport === report.id && { borderColor: report.color, backgroundColor: `${report.color}10` }
                ]}
                onPress={() => setSelectedReport(report.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.reportIcon, { backgroundColor: `${report.color}15` }]}>
                  <Ionicons name={report.icon} size={20} color={report.color} />
                </View>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDesc}>{report.description}</Text>
              </TouchableOpacity>
            </ScaleIn>
          ))}
        </View>

        {renderContent()}

        <FadeInDown delay={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones</Text>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="document-text-outline" size={22} color={colors.primary[500]} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Exportar PDF</Text>
                <Text style={styles.actionSubtitle}>Descargar reporte en formato PDF</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </FadeInDown>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reportCard: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  reportDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
  },
  expenseStat: {
    alignItems: 'center',
  },
  expenseLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  expenseValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  profitValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success,
    marginTop: spacing.md,
  },
  dateRangeCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  flowItem: {
    flex: 1,
    alignItems: 'center',
  },
  flowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  flowLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  flowValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  flowDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
  },
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
