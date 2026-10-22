import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { FadeIn, FadeInDown, StaggerList } from "../../components/animations";
import { BarChart } from "../../components/charts/Charts";
import { AdminHomeHeroCard } from "../../components/admin/AdminHomeHeroCard";
import { AdminHomeEventRow } from "../../components/admin/AdminHomeEventRow";
import { useAdminHomeData } from "../../modules/admin/application/useAdminHomeData";
import { useAuthStore } from "../../store/authStore";
import { useColors, useShadows } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";
import { BREAKPOINTS, useResponsive } from "../../hooks/useResponsive";
import type { AdminAuditLog } from "../../types";
import type { AdminTabParamList, RootStackParamList } from "../../navigation/types";

/**
 * AdminHomeScreen - Pantalla de inicio del panel de administración
 *
 * Esta pantalla sigue el diseño "estilo finanzas" con:
 * - Cabecera con avatar del usuario admin (usa useAuthStore para obtener datos del usuario)
 * - Tarjeta hero con gradiente azul mostrando métricas principales
 * - Tarjeta de progreso semanal con gráfico de actividad
 * - Lista de eventos recientes estilo transacción
 *
 * Navegación:
 * - El botón "Reportes" en la tarjeta hero navega a AdminReportsScreen
 * - "Ver todo" en la sección de eventos navega a AdminReportsScreen
 * - El icono de actualizar en la cabecera ejecuta refetchAll()
 *
 * @see design.md para detalles técnicos
 * @see specs/admin-home/spec.md para requisitos de comportamiento
 */

const PARTIAL_DATA_MESSAGE = "Datos parciales, intenta actualizar";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Agrupa eventos por día de la semana (Lun=0 .. Dom=6) y devuelve total de la semana para la tarjeta de progreso. */
export function getWeeklyProgressFromEvents(
  recentEvents: Pick<AdminAuditLog, "createdAt">[],
): { valuesByDay: number[]; totalWeek: number } {
  const valuesByDay = [0, 0, 0, 0, 0, 0, 0];
  for (const event of recentEvents) {
    const d = new Date(event.createdAt);
    const dayIndex = (d.getDay() + 6) % 7;
    valuesByDay[dayIndex] += 1;
  }
  const totalWeek = valuesByDay.reduce((a, b) => a + b, 0);
  return { valuesByDay, totalWeek };
}

function getInitials(name: string | null | undefined, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0])
        .toUpperCase()
        .slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email && email.length) return email[0].toUpperCase();
  return "?";
}

type AdminHomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, "AdminHome">,
  NativeStackNavigationProp<RootStackParamList>
>;

export const AdminHomeScreen: React.FC = () => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(
    () => createStyles(colors, shadows),
    [colors, shadows],
  );
  const navigation = useNavigation<AdminHomeNavigationProp>();
  const user = useAuthStore((s) => s.user);
  const { width } = useResponsive();
  const isWebDesktop = Platform.OS === "web" && width >= BREAKPOINTS.tablet;

  const { kpis, recentEvents, isRefreshing, blockErrors, refetchAll } =
    useAdminHomeData();

  const weeklyProgress = useMemo(
    () => getWeeklyProgressFromEvents(recentEvents),
    [recentEvents],
  );

  const weeklyChartData = useMemo(
    () =>
      WEEKDAY_LABELS.map((label, i) => ({
        label,
        value: weeklyProgress.valuesByDay[i] ?? 0,
        color: colors.primary[500],
      })),
    [weeklyProgress.valuesByDay, colors.primary],
  );

  const initials = useMemo(
    () => getInitials(user?.name, user?.email),
    [user?.name, user?.email],
  );

  const showHero = !blockErrors.kpis || kpis != null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refetchAll()}
            tintColor={colors.primary[500]}
          />
        }
      >
        <FadeIn duration={280}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colors.primary[500] },
                ]}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>{isWebDesktop ? "Centro de operaciones" : "Inicio"}</Text>
              {isWebDesktop && <Text style={styles.headerMeta}>RESUMEN DE PLATAFORMA · ACTUALIZACIÓN EN TIEMPO REAL</Text>}
            </View>
            <TouchableOpacity
              onPress={() => void refetchAll()}
              style={styles.headerIconButton}
              accessibilityRole="button"
              accessibilityLabel="Actualizar datos del inicio admin"
              testID="admin-home-refresh-button"
            >
              <Ionicons name="refresh" size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {blockErrors.kpis && (
          <View style={styles.warningRow} testID="admin-home-kpis-warning">
            <Ionicons name="warning-outline" size={16} color={colors.warning} />
            <Text style={styles.warningText}>{PARTIAL_DATA_MESSAGE}</Text>
          </View>
        )}

        {showHero && (
          <FadeInDown delay={50} duration={280}>
            <AdminHomeHeroCard
              title="Total usuarios"
              value={kpis?.totalUsers ?? 0}
              onPrimaryAction={() => navigation.navigate("AdminReports")}
              onSecondaryAction={() => void refetchAll()}
              primaryLabel="Reportes"
              secondaryLabel="Actualizar"
            />
          </FadeInDown>
        )}

        {isWebDesktop && kpis && (
          <View style={styles.kpiStrip} testID="admin-home-kpi-strip">
            <View style={styles.kpiCell}>
              <Text style={styles.kpiLabel}>ACTIVOS · 30D</Text>
              <Text style={styles.kpiValue}>{kpis.activeUsers30d.toLocaleString()}</Text>
            </View>
            <View style={styles.kpiCell}>
              <Text style={styles.kpiLabel}>NUEVOS</Text>
              <Text style={styles.kpiValue}>{kpis.newUsersPeriod.toLocaleString()}</Text>
            </View>
            <View style={styles.kpiCell}>
              <Text style={styles.kpiLabel}>EN RIESGO</Text>
              <Text style={[styles.kpiValue, { color: colors.warning }]}>{Number(kpis.revenueAtRiskCup).toLocaleString("es-CU")} CUP</Text>
            </View>
            <View style={styles.kpiCell}>
              <Text style={styles.kpiLabel}>CONVERSIÓN</Text>
              <Text style={[styles.kpiValue, { color: colors.success }]}>{kpis.trialToPaidConversionPct.toFixed(1)}%</Text>
            </View>
          </View>
        )}

        <FadeInDown delay={150} duration={280}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Progreso semanal</Text>
            {weeklyProgress.totalWeek === 0 ? (
              <Text style={styles.empty}>Sin datos esta semana</Text>
            ) : (
              <>
                <View style={styles.weeklyHeader}>
                  <Text
                    style={[styles.weeklyValue, { color: colors.text.primary }]}
                  >
                    +{weeklyProgress.totalWeek} eventos
                  </Text>
                </View>
                <BarChart
                  data={weeklyChartData}
                  height={100}
                  showValues={false}
                  showLabels={true}
                  animated={true}
                />
              </>
            )}
          </View>
        </FadeInDown>

        <FadeInDown delay={200} duration={280}>
          <View style={styles.eventsSection}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsTitle}>Eventos recientes</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AdminReports")}
                style={styles.seeAllButton}
                accessibilityRole="button"
                accessibilityLabel="Ver todos los reportes"
                testID="admin-home-see-all-events"
              >
                <Text style={styles.seeAllText}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            {blockErrors.events && (
              <View
                style={styles.warningRow}
                testID="admin-home-events-warning"
              >
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color={colors.warning}
                />
                <Text style={styles.warningText}>{PARTIAL_DATA_MESSAGE}</Text>
              </View>
            )}
            <View style={styles.eventsList}>
              {recentEvents.length === 0 ? (
                <Text style={styles.empty}>Sin eventos recientes</Text>
              ) : (
                <StaggerList staggerDelay={80} initialDelay={0}>
                  {recentEvents.slice(0, 8).map((event, idx) => (
                    <AdminHomeEventRow
                      key={`${event.id ?? event.action}-${idx}`}
                      action={event.action}
                      createdAt={event.createdAt}
                    />
                  ))}
                </StaggerList>
              )}
            </View>
          </View>
        </FadeInDown>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (
  colors: ReturnType<typeof useColors>,
  shadows: ReturnType<typeof useShadows>,
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    headerCopy: { flex: 1, marginLeft: spacing.md },
    headerMeta: { color: colors.text.tertiary, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginTop: 4 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    avatarContainer: { width: 44, height: 44 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: colors.text.inverse,
      fontWeight: "700",
      fontSize: 16,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    kpiStrip: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: "hidden",
    },
    kpiCell: { flex: 1, padding: spacing.md, borderRightWidth: 1, borderRightColor: colors.border, gap: 5 },
    kpiLabel: { color: colors.text.tertiary, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
    kpiValue: { color: colors.text.primary, fontSize: 20, fontWeight: "800", fontVariant: ["tabular-nums"] },
    headerIconButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    warningRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: spacing.sm,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: borderRadius.md,
      backgroundColor: `${colors.warning}22`,
    },
    warningText: { color: colors.text.secondary, fontSize: 12 },
    panel: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
      marginBottom: spacing.md,
    },
    panelTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    weeklyHeader: { marginBottom: spacing.sm },
    weeklyValue: { fontSize: 18, fontWeight: "700" },
    empty: { color: colors.text.secondary, paddingVertical: spacing.sm },
    eventsSection: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
      marginBottom: spacing.md,
    },
    eventsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    eventsTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text.primary,
    },
    seeAllButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      minHeight: 44,
      justifyContent: "center",
    },
    seeAllText: { fontSize: 14, fontWeight: "600", color: colors.primary[500] },
    eventsList: { gap: 0 },
  });
