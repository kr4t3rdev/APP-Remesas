import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Alert } from "../../utils/alert";

import { Ionicons } from "@expo/vector-icons";
import { PressableScale, FadeInDown } from "../animations";
import { Badge } from "../ui/Badge";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type { Objective } from "../../types";

type ObjectiveCardProps = {
  objective: Objective;
  index?: number;
  onPress?: (objective: Objective) => void;
  onEdit?: (objective: Objective) => void;
  onDelete?: (objective: Objective) => void;
  onStatusChange?: (
    objective: Objective,
    newStatus: "ACTIVO" | "PAUSADO" | "COMPLETADO",
  ) => void;
};

const STATUS_COLORS = {
  ACTIVO: "#10B981",
  COMPLETADO: "#6366F1",
  PAUSADO: "#F59E0B",
};

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  index = 0,
  onPress,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const progress = Math.min(objective.percentage || 0, 100);
  const progressColor = progress >= 100 ? "#10B981" : themeColors.primary[500];
  const statusColor =
    STATUS_COLORS[objective.status] || themeColors.text.secondary;

  const handleEdit = () => {
    onEdit?.(objective);
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Objetivo",
      `¿Estás seguro de eliminar "${objective.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete?.(objective),
        },
      ],
    );
  };

  const handleStatusPress = () => {
    const options = [
      { label: "Activo", value: "ACTIVO" as const },
      { label: "Pausado", value: "PAUSADO" as const },
      { label: "Completado", value: "COMPLETADO" as const },
    ];

    Alert.alert(
      "Cambiar Estado",
      "Selecciona el nuevo estado",
      options.map((opt) => ({
        text: opt.label,
        onPress: () => {
          if (opt.value !== objective.status) {
            onStatusChange?.(objective, opt.value);
          }
        },
      })),
    );
  };

  return (
    <FadeInDown delay={index * 50}>
      <PressableScale
        onPress={() => onPress?.(objective)}
        style={styles.wrapper}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: themeColors.card },
            themeShadows.sm,
          ]}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text
                style={[styles.name, { color: themeColors.text.primary }]}
                numberOfLines={1}
              >
                {objective.name}
              </Text>
              {objective.description && (
                <Text
                  style={[
                    styles.description,
                    { color: themeColors.text.secondary },
                  ]}
                  numberOfLines={2}
                >
                  {objective.description}
                </Text>
              )}
            </View>
            <TouchableOpacity
              testID="objective-status-badge"
              onPress={handleStatusPress}
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}15` },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {objective.status}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text
                style={[
                  styles.progressLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Progreso
              </Text>
              <Text style={[styles.progressPercent, { color: progressColor }]}>
                {progress.toFixed(1)}%
              </Text>
            </View>
            <View
              style={[
                styles.progressBarBg,
                { backgroundColor: themeColors.border },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%`, backgroundColor: progressColor },
                ]}
              />
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: themeColors.border }]}>
            <View style={styles.amountItem}>
              <Text
                style={[
                  styles.amountLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Actual
              </Text>
              <Text
                style={[
                  styles.amountValue,
                  { color: themeColors.text.primary },
                ]}
              >
                $ {Number(objective.currentAmount).toLocaleString()}
              </Text>
            </View>
            <View style={styles.amountItem}>
              <Text
                style={[
                  styles.amountLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Meta
              </Text>
              <Text
                style={[
                  styles.amountValue,
                  { color: themeColors.text.primary },
                ]}
              >
                $ {Number(objective.targetAmount).toLocaleString()}
              </Text>
            </View>
            <View style={styles.amountItem}>
              <Text
                style={[
                  styles.amountLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Falta
              </Text>
              <Text style={[styles.amountValue, { color: themeColors.danger }]}>
                $ {Number(objective.remaining || 0).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              testID="objective-edit-button"
              onPress={handleEdit}
              style={[
                styles.actionButton,
                { backgroundColor: `${themeColors.primary[500]}15` },
              ]}
            >
              <Ionicons
                name="pencil"
                size={16}
                color={themeColors.primary[500]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              testID="objective-delete-button"
              onPress={handleDelete}
              style={[
                styles.actionButton,
                { backgroundColor: `${themeColors.danger}15` },
              ]}
            >
              <Ionicons name="trash" size={16} color={themeColors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </PressableScale>
    </FadeInDown>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 8,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  amountItem: {
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 11,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
