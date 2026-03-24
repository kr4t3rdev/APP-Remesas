import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, borderRadius, shadows } from "../../theme";
import type { CashAudit, CashAdjustment } from "../../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useCashAdjustmentsQuery,
  useCashAuditsQuery,
} from "../../modules/cash/application/useCash";

type HistoryItem =
  | (CashAudit & { itemType: "AUDIT" })
  | (CashAdjustment & { itemType: "ADJUSTMENT" });

export const CashHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const auditsQuery = useCashAuditsQuery();
  const adjustmentsQuery = useCashAdjustmentsQuery();

  const items = useMemo<HistoryItem[]>(() => {
    const formattedAudits = (auditsQuery.data ?? []).map((a: CashAudit) => ({
      ...a,
      itemType: "AUDIT" as const,
    }));
    const formattedAdjustments = (adjustmentsQuery.data ?? []).map(
      (a: CashAdjustment) => ({
        ...a,
        itemType: "ADJUSTMENT" as const,
      }),
    );

    return [...formattedAudits, ...formattedAdjustments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [adjustmentsQuery.data, auditsQuery.data]);

  const handleRefresh = async () => {
    await Promise.all([auditsQuery.refetch(), adjustmentsQuery.refetch()]);
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const isAudit = item.itemType === "AUDIT";
    const date = new Date(item.createdAt);

    // Configuración visual según el tipo
    let iconName: keyof typeof Ionicons.glyphMap = "clipboard";
    let iconColor = colors.primary[500];
    let iconBg = colors.primary[50];
    let title = "";
    let subtitle = "";
    let amount = "";
    let amountColor = colors.text.primary;

    if (isAudit) {
      iconName = "clipboard-outline";
      iconColor = colors.primary[500];
      iconBg = colors.primary[50];
      title = "Arqueo de Caja";
      subtitle = item.notes || "Sin notas";
      const diff = item.difference;
      amount = `Diff: ${diff > 0 ? "+" : ""}${diff}`;
      amountColor =
        diff === 0 ? colors.success : diff > 0 ? colors.success : colors.danger;
    } else {
      const isIncome = item.type === "INGRESO";
      iconName = isIncome ? "arrow-up-circle" : "arrow-down-circle";
      iconColor = isIncome ? colors.success : colors.danger;
      iconBg = isIncome ? "#F0FFF4" : "#FFF5F5";
      title = isIncome ? "Ingreso Manual" : "Egreso Manual";
      subtitle = item.reason || "Sin motivo";
      amount = `${isIncome ? "+" : "-"}${item.amount}`;
      amountColor = isIncome ? colors.success : colors.danger;
    }

    return (
      <View style={styles.itemContainer}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.amount, { color: amountColor }]}>
              {item.currency?.symbol} {amount}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
            <Text style={styles.date}>
              {format(date, "d MMM, HH:mm", { locale: es })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Caja</Text>
        <View style={{ width: 24 }} />
      </View>

      {auditsQuery.isLoading || adjustmentsQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.itemType}-${item.id}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={
                auditsQuery.isRefetching || adjustmentsQuery.isRefetching
              }
              onRefresh={handleRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="documents-outline"
                size={48}
                color={colors.text.tertiary}
              />
              <Text style={styles.emptyText}>
                No hay movimientos registrados
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: spacing.md,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary,
  },
});
