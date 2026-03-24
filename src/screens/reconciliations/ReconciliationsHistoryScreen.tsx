import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useShadows } from "../../store/themeStore";
import { useReconciliationsQuery } from "../../modules/reconciliations/application/useReconciliations";
import { FadeIn, FadeInDown } from "../../components/animations";
import { spacing, borderRadius } from "../../theme";
import type { Reconciliation } from "../../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigation } from "@react-navigation/native";

export const ReconciliationsHistoryScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const navigation = useNavigation<any>();

  const {
    data: reconciliations,
    isLoading,
    refetch,
  } = useReconciliationsQuery();

  const handleRefresh = async () => {
    await refetch();
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: Reconciliation;
    index: number;
  }) => {
    const isExpense = item.type === "EXPENSE";

    return (
      <FadeInDown delay={index * 30}>
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: themeColors.card },
            themeShadows.sm,
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isExpense
                    ? themeColors.financial.expenseLight
                    : themeColors.financial.incomeLight,
                },
              ]}
            >
              <Ionicons
                name={isExpense ? "receipt" : "cash"}
                size={20}
                color={
                  isExpense
                    ? themeColors.financial.expense
                    : themeColors.financial.income
                }
              />
            </View>
            <View style={styles.cardInfo}>
              <Text
                style={[styles.cardTitle, { color: themeColors.text.primary }]}
              >
                {isExpense ? "Gasto Reconciliado" : "Ingreso Reconciliado"}
              </Text>
              <Text
                style={[styles.cardDate, { color: themeColors.text.secondary }]}
              >
                {format(new Date(item.reconciledAt), "dd MMM yyyy, HH:mm", {
                  locale: es,
                })}
              </Text>
            </View>
          </View>

          <View
            style={[styles.cardFooter, { borderTopColor: themeColors.border }]}
          >
            <Text
              style={[
                styles.detailsText,
                { color: themeColors.text.secondary },
              ]}
            >
              ID Transacción: {item.transactionId}
            </Text>
            {item.bankAccountId && (
              <Text
                style={[
                  styles.detailsText,
                  { color: themeColors.text.secondary },
                ]}
              >
                Cuenta: #{item.bankAccountId}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </FadeInDown>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <FadeIn>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={themeColors.text.primary}
            />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              Historial
            </Text>
            <Text
              style={[styles.subtitle, { color: themeColors.text.secondary }]}
            >
              Reconciliaciones realizadas
            </Text>
          </View>
        </View>
      </FadeIn>

      <FlatList
        data={reconciliations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="documents-outline"
              size={64}
              color={themeColors.text.tertiary}
            />
            <Text
              style={[
                styles.emptyStateText,
                { color: themeColors.text.secondary },
              ]}
            >
              No hay reconciliaciones
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDate: {
    fontSize: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: spacing.md,
    fontWeight: "500",
  },
});
