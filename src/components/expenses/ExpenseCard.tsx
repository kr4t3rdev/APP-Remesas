import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Alert } from "../../utils/alert";

import { Ionicons } from "@expo/vector-icons";
import { PressableScale, FadeInDown } from "../animations";
import { Badge } from "../ui/Badge";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type { Expense } from "../../types";

type ExpenseCardProps = {
  expense: Expense;
  index?: number;
  onPress?: (expense: Expense) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  onReconcile?: (expense: Expense) => void;
};

const CATEGORY_ICONS: Record<string, string> = {
  renta: "home",
  servicios: "bulb",
  salario: "people",
  insumos: "cube",
  otros: "ellipsis-horizontal",
};

const CATEGORY_COLORS: Record<string, string> = {
  renta: "#EF4444",
  servicios: "#F59E0B",
  salario: "#10B981",
  insumos: "#6366F1",
  otros: "#64748B",
};

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  index = 0,
  onPress,
  onEdit,
  onDelete,
  onReconcile,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const catColor =
    CATEGORY_COLORS[expense.category] || themeColors.text.secondary;
  const catIcon = CATEGORY_ICONS[expense.category] || "ellipsis-horizontal";

  const handleEdit = () => {
    onEdit?.(expense);
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Gasto",
      `¿Estás seguro de eliminar "${expense.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete?.(expense),
        },
      ],
    );
  };

  const handleReconcile = () => {
    onReconcile?.(expense);
  };

  return (
    <FadeInDown delay={index * 50}>
      <PressableScale onPress={() => onPress?.(expense)} style={styles.wrapper}>
        <View
          style={[
            styles.card,
            { backgroundColor: themeColors.card },
            themeShadows.sm,
          ]}
        >
          <View style={styles.mainContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${catColor}15` },
              ]}
            >
              <Ionicons name={catIcon as any} size={24} color={catColor} />
            </View>

            <View style={styles.info}>
              <Text
                style={[
                  styles.description,
                  { color: themeColors.text.primary },
                ]}
                numberOfLines={1}
              >
                {expense.description}
              </Text>
              <View style={styles.meta}>
                <Text
                  style={[
                    styles.category,
                    { color: themeColors.text.secondary },
                  ]}
                >
                  {expense.category}
                </Text>
                <Text
                  style={[
                    styles.separator,
                    { color: themeColors.text.tertiary },
                  ]}
                >
                  •
                </Text>
                <Text
                  style={[styles.date, { color: themeColors.text.secondary }]}
                >
                  {new Date(expense.date).toLocaleDateString("es-ES")}
                </Text>
              </View>
            </View>

            <View style={styles.amountContainer}>
              <Text style={[styles.amount, { color: themeColors.danger }]}>
                - $ {Number(expense.amount).toLocaleString()}
              </Text>
              <Text
                style={[styles.currency, { color: themeColors.text.secondary }]}
              >
                {expense.currency?.code}
              </Text>
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: themeColors.border }]}>
            <Badge
              text={expense.status === "PENDIENTE" ? "Pendiente" : "Pagado"}
              variant={expense.status === "PENDIENTE" ? "warning" : "success"}
            />

            <View style={styles.actions}>
              <TouchableOpacity
                testID="expense-edit-button"
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
                testID="expense-reconcile-button"
                onPress={handleReconcile}
                style={[
                  styles.actionButton,
                  { backgroundColor: `${themeColors.success}15` },
                ]}
              >
                <Ionicons name="link" size={16} color={themeColors.success} />
              </TouchableOpacity>

              <TouchableOpacity
                testID="expense-delete-button"
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
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  category: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  separator: {
    marginHorizontal: 6,
  },
  date: {
    fontSize: 12,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  currency: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
