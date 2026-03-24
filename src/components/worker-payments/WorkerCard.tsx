import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../animations";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type { Worker } from "../../types";

type WorkerCardProps = {
  worker: Worker;
  index?: number;
  onExpand?: (worker: Worker) => void;
  onTransaction?: (worker: Worker) => void;
  onAddBalance?: (worker: Worker) => void;
  onEdit?: (worker: Worker) => void;
  onDelete?: (worker: Worker) => void;
  isExpanded?: boolean;
};

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  index = 0,
  onExpand,
  onTransaction,
  onAddBalance,
  onEdit,
  onDelete,
  isExpanded = false,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const workerSubtitle = worker.phone?.trim() ? worker.phone : "Trabajador";

  return (
    <FadeInDown delay={index * 50}>
      <View
        style={[
          styles.card,
          { backgroundColor: themeColors.card },
          themeShadows.sm,
        ]}
      >
        <View style={styles.mainContent}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: `${themeColors.primary[500]}20` },
              ]}
            >
              <Text
                style={[styles.avatarText, { color: themeColors.primary[500] }]}
              >
                {worker.initials ?? "TR"}
              </Text>
            </View>
            <View style={styles.info}>
              <Text
                style={[styles.name, { color: themeColors.text.primary }]}
                numberOfLines={1}
              >
                {worker.name}
              </Text>
              <Text
                style={[styles.subtitle, { color: themeColors.text.secondary }]}
              >
                {workerSubtitle}
              </Text>
            </View>
            <TouchableOpacity
              testID="worker-expand-button"
              onPress={() => onExpand?.(worker)}
              style={styles.expandIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={
                  isExpanded
                    ? "ellipsis-horizontal-circle"
                    : "ellipsis-vertical"
                }
                size={20}
                color={themeColors.text.secondary}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.statsContainer,
              { backgroundColor: themeColors.background },
            ]}
          >
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                SALDO ACTUAL
              </Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      Number(worker.balance) < 0
                        ? themeColors.danger
                        : themeColors.text.primary,
                  },
                ]}
              >
                ${Number(worker.balance).toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                GANANCIA ACUM.
              </Text>
              <Text style={[styles.statValue, { color: themeColors.success }]}>
                ${Number(worker.accumulatedProfit ?? 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.actions, { borderTopColor: themeColors.border }]}>
          <TouchableOpacity
            testID="worker-transaction-button"
            onPress={() => onTransaction?.(worker)}
            style={[styles.actionButton, { backgroundColor: "#3B82F615" }]}
          >
            <Ionicons name="receipt-outline" size={18} color="#3B82F6" />
            <Text style={[styles.actionText, { color: "#3B82F6" }]}>
              Transacciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="worker-add-balance-button"
            onPress={() => onAddBalance?.(worker)}
            style={[styles.actionButton, { backgroundColor: "#10B98115" }]}
          >
            <Ionicons name="add-circle-outline" size={18} color="#10B981" />
            <Text style={[styles.actionText, { color: "#10B981" }]}>
              Agregar Saldo
            </Text>
          </TouchableOpacity>
        </View>
        {isExpanded && (
          <View
            style={[
              styles.secondaryActions,
              { borderTopColor: themeColors.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => onEdit?.(worker)}
              style={styles.secondaryActionButton}
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={themeColors.text.secondary}
              />
              <Text
                style={[
                  styles.secondaryActionText,
                  { color: themeColors.text.secondary },
                ]}
              >
                Editar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete?.(worker)}
              style={styles.secondaryActionButton}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={themeColors.danger}
              />
              <Text
                style={[
                  styles.secondaryActionText,
                  { color: themeColors.danger },
                ]}
              >
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </FadeInDown>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  mainContent: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statsContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  expandIcon: {
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
