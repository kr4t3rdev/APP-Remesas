import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAdminHomeData } from "../../modules/admin/application/useAdminHomeData";
import { useColors } from "../../store/themeStore";
import { webMetrics, webType } from "../../web/design/webTokens";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getWeeklyValues(events: Array<{ createdAt: string }>) {
  const values = [0, 0, 0, 0, 0, 0, 0];
  events.forEach(({ createdAt }) => {
    const date = new Date(createdAt);
    values[(date.getDay() + 6) % 7] += 1;
  });
  return values;
}

function formatEventDate(value: string) {
  const date = new Date(value);
  const day = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (day <= 0) return "Hoy";
  if (day === 1) return "Ayer";
  return `Hace ${day} días`;
}

export const AdminHomeScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { kpis, recentEvents, isLoadingInitial, blockErrors, refetchAll } = useAdminHomeData();
  const weeklyValues = useMemo(() => getWeeklyValues(recentEvents), [recentEvents]);
  const maxWeekly = Math.max(...weeklyValues, 1);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headingRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary[500] }]}>CASHFLOW / ADMIN</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>Control de plataforma</Text>
          <Text style={[styles.operationsLabel, { color: colors.text.tertiary }]}>Centro de operaciones</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Una lectura rápida de usuarios, licencias y actividad operativa.</Text>
        </View>
        <Pressable
          testID="admin-web-refresh"
          accessibilityRole="button"
          accessibilityLabel="Actualizar datos de plataforma"
          onPress={() => void refetchAll()}
          style={({ pressed }) => [styles.refresh, { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.72 : 1 }]}
        >
          <View testID="admin-home-refresh-button" style={styles.refreshInner}>
            <Ionicons name="refresh-outline" size={18} color={colors.text.primary} />
            <Text style={[styles.refreshText, { color: colors.text.primary }]}>Actualizar</Text>
          </View>
        </Pressable>
      </View>

      {blockErrors.kpis && (
        <View style={[styles.alert, { backgroundColor: `${colors.warning}18`, borderColor: `${colors.warning}55` }]} accessibilityRole="alert">
          <Ionicons name="warning-outline" size={17} color={colors.warning} />
          <Text style={[styles.alertText, { color: colors.text.primary }]}>Datos parciales. Actualiza para reintentar.</Text>
        </View>
      )}

      <View style={styles.kpiGrid}>
        <KpiCard label="Usuarios totales" value={kpis?.totalUsers ?? 0} detail="Cuentas registradas" icon="people-outline" colors={colors} />
        <KpiCard label="Activos · 30 días" value={kpis?.activeUsers30d ?? 0} detail="Con actividad reciente" icon="pulse-outline" colors={colors} />
        <KpiCard label="Licencias por vencer" value={kpis?.expiringIn7d ?? 0} detail="Próximos 7 días" icon="time-outline" colors={colors} tone="warning" />
        <KpiCard label="Conversión" value={`${(kpis?.trialToPaidConversionPct ?? 0).toFixed(1)}%`} detail="Prueba a pago" icon="trending-up-outline" colors={colors} tone="success" />
      </View>

      <View style={styles.mainGrid}>
        <View style={[styles.panel, styles.activityPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={[styles.panelEyebrow, { color: colors.text.tertiary }]}>MONITOREO</Text>
              <Text style={[styles.panelTitle, { color: colors.text.primary }]}>Actividad semanal</Text>
            </View>
            <Text style={[styles.panelMetric, { color: colors.primary[500] }]}>{recentEvents.length} eventos</Text>
          </View>
          <View style={styles.chart} accessibilityLabel="Gráfico de actividad semanal">
            {weeklyValues.map((value, index) => (
              <View key={WEEKDAY_LABELS[index]} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { backgroundColor: colors.primary[500], height: `${Math.max((value / maxWeekly) * 100, value ? 12 : 4)}%` }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.text.tertiary }]}>{WEEKDAY_LABELS[index]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.panel, styles.eventsPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={[styles.panelEyebrow, { color: colors.text.tertiary }]}>AUDITORÍA</Text>
              <Text style={[styles.panelTitle, { color: colors.text.primary }]}>Actividad reciente</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Ver todos los reportes" onPress={() => navigation.navigate("AdminReports")} style={styles.linkButton}>
              <Text style={[styles.linkText, { color: colors.primary[500] }]}>Ver todo</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.primary[500]} />
            </Pressable>
          </View>
          {isLoadingInitial ? <Text style={[styles.empty, { color: colors.text.secondary }]}>Cargando actividad…</Text> : recentEvents.length === 0 ? <Text style={[styles.empty, { color: colors.text.secondary }]}>Sin eventos recientes</Text> : recentEvents.slice(0, 6).map((event, index) => (
            <View key={`${event.id ?? event.action}-${index}`} style={[styles.eventRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <View style={[styles.eventDot, { backgroundColor: colors.primary[500] }]} />
              <Text style={[styles.eventAction, { color: colors.text.primary }]} numberOfLines={1}>{event.action}</Text>
              <Text style={[styles.eventDate, { color: colors.text.tertiary }]}>{formatEventDate(event.createdAt)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

type KpiCardProps = { label: string; value: number | string; detail: string; icon: keyof typeof Ionicons.glyphMap; colors: ReturnType<typeof useColors>; tone?: "warning" | "success" };

const KpiCard: React.FC<KpiCardProps> = ({ label, value, detail, icon, colors, tone }) => (
  <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={styles.kpiHeader}>
      <Text style={[styles.kpiLabel, { color: colors.text.tertiary }]}>{label}</Text>
      <View style={[styles.kpiIcon, { backgroundColor: `${tone === "warning" ? colors.warning : tone === "success" ? colors.success : colors.primary[500]}18` }]}>
        <Ionicons name={icon} size={17} color={tone === "warning" ? colors.warning : tone === "success" ? colors.success : colors.primary[500]} />
      </View>
    </View>
    <Text style={[styles.kpiValue, { color: tone === "warning" ? colors.warning : tone === "success" ? colors.success : colors.text.primary }]}>{value}</Text>
    <Text style={[styles.kpiDetail, { color: colors.text.secondary }]}>{detail}</Text>
  </View>
);

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { width: "100%", maxWidth: webMetrics.contentMaxWidth, alignSelf: "center", padding: 32, paddingBottom: 56, gap: 24 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 20 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8 },
  title: { fontSize: webType.titleSize, lineHeight: 36, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: webType.bodySize, lineHeight: 22, marginTop: 5, maxWidth: 620 }, operationsLabel: { fontSize: 12, fontWeight: "800", marginTop: 7, letterSpacing: 0.5 },
  refresh: { minHeight: webMetrics.controlHeight, paddingHorizontal: 16, borderWidth: 1, borderRadius: webMetrics.fieldRadius, justifyContent: "center" }, refreshInner: { minHeight: webMetrics.controlHeight - 2, flexDirection: "row", alignItems: "center", gap: 8 },
  refreshText: { fontSize: webType.bodySize, fontWeight: "700" },
  alert: { minHeight: 40, paddingHorizontal: 12, borderRadius: webMetrics.fieldRadius, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  alertText: { fontSize: webType.bodySize },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  kpiCard: { flexGrow: 1, flexBasis: 190, minHeight: 142, padding: 18, borderWidth: 1, borderRadius: webMetrics.panelRadius, justifyContent: "space-between" },
  kpiHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  kpiLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", flexShrink: 1 },
  kpiIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  kpiValue: { fontSize: 30, lineHeight: 34, fontWeight: "800", fontVariant: ["tabular-nums"] },
  kpiDetail: { fontSize: 12, marginTop: 4 },
  mainGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  panel: { borderWidth: 1, borderRadius: webMetrics.panelRadius, padding: 20 },
  activityPanel: { flexGrow: 1, flexBasis: 380, minHeight: 300 },
  eventsPanel: { flexGrow: 1, flexBasis: 380, minHeight: 300 },
  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20 },
  panelEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 5 },
  panelTitle: { fontSize: 18, lineHeight: 24, fontWeight: "800" },
  panelMetric: { fontSize: 13, fontWeight: "800", paddingTop: 18 },
  chart: { flex: 1, minHeight: 188, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, paddingTop: 10 },
  barColumn: { flex: 1, alignItems: "center", gap: 8 },
  barTrack: { width: "100%", height: 160, justifyContent: "flex-end", borderRadius: 7, overflow: "hidden", backgroundColor: "rgba(100,116,139,0.10)" },
  bar: { width: "100%", borderRadius: 7, minHeight: 4 },
  barLabel: { fontSize: 11, fontWeight: "700" },
  linkButton: { minHeight: webMetrics.touchTarget, paddingHorizontal: 4, flexDirection: "row", alignItems: "center", gap: 5 },
  linkText: { fontSize: 13, fontWeight: "800" },
  eventRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10 },
  eventDot: { width: 8, height: 8, borderRadius: 4 },
  eventAction: { flex: 1, fontSize: 13, fontWeight: "700" },
  eventDate: { fontSize: 12 },
  empty: { fontSize: 14, paddingVertical: 28, textAlign: "center" },
});
