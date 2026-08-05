import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../store/themeStore";
import { spacing, borderRadius } from "../../theme";
import { FadeInDown, ScaleIn } from "../animations";
import { selectTopWorkersByBalance, formatPrimaryBalance } from "../../modules/worker-payments/application/topWorkersSelector";
import type { Worker, ExchangeRate, Currency } from "../../types";
import type { RootStackParamList } from "../../navigation/types";

type TopWorkersCardProps = {
  workers: Worker[];
  rates: ExchangeRate[];
  primaryCurrency: Currency | null | undefined;
  isLoading?: boolean;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TopWorkersCard: React.FC<TopWorkersCardProps> = ({
  workers,
  rates,
  primaryCurrency,
  isLoading = false,
}) => {
  const colors = useColors();
  const navigation = useNavigation<NavigationProp>();

  const topWorkers = selectTopWorkersByBalance(workers, rates, {
    primaryCurrencyId: primaryCurrency?.id,
    limit: 5,
  });

  const handlePressSeeAll = () => {
    // Redirige al tab o screen de Trabajadores
    navigation.navigate("BusinessWorkers");
  };

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: `${colors.primary[500]}08` }]}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
          Top Trabajadores (Saldos)
        </Text>
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Calculando posiciones...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Rendimiento de Trabajadores
        </Text>
        {topWorkers.length > 0 && (
          <TouchableOpacity
            testID="top-workers-see-all"
            onPress={handlePressSeeAll}
            style={styles.seeAllButton}
            accessibilityRole="button"
            accessibilityLabel="Ver todos los trabajadores"
          >
            <Text style={[styles.seeAllText, { color: colors.primary[500] }]}>
              Ver todo
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.primary[500]}
            />
          </TouchableOpacity>
        )}
      </View>

      <View
        testID="top-workers-surface"
        style={[
          styles.card,
          { backgroundColor: `${colors.primary[500]}08` },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
          Ranking por Saldo Acumulado ({primaryCurrency?.code ?? "—"})
        </Text>

        {topWorkers.length > 0 ? (
          <View style={styles.list}>
            {topWorkers.map((worker, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;

              return (
                <FadeInDown key={worker.id} delay={100 + index * 50}>
                  <View
                    testID={`top-worker-row-${rank}`}
                    style={[
                      styles.row,
                      index < topWorkers.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.leftSection}>
                      <View style={styles.rankContainer}>
                        <Text
                          style={[
                            styles.rankText,
                            {
                              color: isFirst
                                ? colors.primary[500]
                                : colors.text.tertiary,
                              fontWeight: isFirst ? "700" : "500",
                            },
                          ]}
                        >
                          #{rank}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: isFirst
                              ? `${colors.primary[500]}25`
                              : `${colors.text.tertiary}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            {
                              color: isFirst
                                ? colors.primary[500]
                                : colors.text.secondary,
                            },
                          ]}
                        >
                          {worker.initials}
                        </Text>
                      </View>

                      <View style={styles.nameBlock}>
                        <Text
                          style={[
                            styles.workerName,
                            { color: colors.text.primary },
                          ]}
                          numberOfLines={1}
                        >
                          {worker.name}
                        </Text>
                        {worker.hasUnconvertedBalance && (
                          <View style={styles.warningBadge} testID="unconverted-warning">
                            <Ionicons
                              name="warning-outline"
                              size={12}
                              color={colors.danger}
                            />
                            <Text style={[styles.warningText, { color: colors.danger }]}>
                              Sin tasa en alguna moneda
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.rightSection}>
                      <Text
                        style={[
                          styles.balanceText,
                          {
                            color: isFirst
                              ? colors.primary[500]
                              : colors.text.primary,
                            fontWeight: isFirst ? "700" : "600",
                          },
                        ]}
                      >
                        {formatPrimaryBalance(
                          worker.totalBalanceInPrimary,
                          primaryCurrency,
                        )}
                      </Text>
                    </View>
                  </View>
                </FadeInDown>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState} testID="top-workers-empty">
            <Ionicons
              name="people-outline"
              size={36}
              color={colors.text.tertiary}
            />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No hay trabajadores con saldo registrado para mostrar.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.md,
    opacity: 0.85,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  rankContainer: {
    width: 32,
    alignItems: "flex-start",
  },
  rankText: {
    fontSize: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
  },
  nameBlock: {
    flex: 1,
    minWidth: 0,
  },
  workerName: {
    fontSize: 15,
    fontWeight: "600",
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  warningText: {
    fontSize: 11,
    fontWeight: "500",
  },
  rightSection: {
    alignItems: "flex-end",
    marginLeft: spacing.sm,
  },
  balanceText: {
    fontSize: 15,
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
});
