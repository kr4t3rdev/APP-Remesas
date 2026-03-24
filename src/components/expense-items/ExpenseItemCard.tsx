import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../animations";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type { ExpenseItem } from "../../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type ExpenseItemCardProps = {
  expenseItem: ExpenseItem;
  index: number;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (item: ExpenseItem) => void;
};

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  Inmuebles: { bg: "#FEE2E2", icon: "#EF4444" },
  Servicios: { bg: "#DBEAFE", icon: "#3B82F6" },
  Operaciones: { bg: "#D1FAE5", icon: "#10B981" },
  default: { bg: "#F1F5F9", icon: "#64748B" },
};

export const ExpenseItemCard: React.FC<ExpenseItemCardProps> = ({
  expenseItem,
  index,
  onEdit,
  onDelete,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const amount = parseFloat(expenseItem.amount);
  const formattedAmount = `$${amount.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const categoryConfig =
    CATEGORY_COLORS[expenseItem.category || ""] || CATEGORY_COLORS.default;

  const createdDate = new Date(expenseItem.createdAt);
  const formattedDate = format(createdDate, "dd MMM yyyy", { locale: es });

  return (
    <FadeInDown delay={index * 50}>
      <TouchableOpacity
        testID={`expense-item-card-${expenseItem.id}`}
        activeOpacity={0.7}
        onPress={() => onEdit(expenseItem)}
        onLongPress={() => onDelete(expenseItem)}
        style={[
          styles.card,
          { backgroundColor: themeColors.card },
          themeShadows.sm,
        ]}
      >
        <View style={styles.iconContainer}>
          <View
            style={[styles.iconCircle, { backgroundColor: categoryConfig.bg }]}
          >
            <Ionicons
              name="cube-outline"
              size={20}
              color={categoryConfig.icon}
            />
          </View>
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.name, { color: themeColors.text.primary }]}
            numberOfLines={1}
          >
            {expenseItem.name}
          </Text>
          <View style={styles.metaRow}>
            {expenseItem.category ? (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: `${categoryConfig.icon}15` },
                ]}
              >
                <Text
                  style={[styles.categoryText, { color: categoryConfig.icon }]}
                >
                  {expenseItem.category}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.noCategory,
                  { color: themeColors.text.tertiary },
                ]}
              >
                Sin categoría
              </Text>
            )}
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={themeColors.text.tertiary}
              />
              <Text
                style={[styles.dateText, { color: themeColors.text.tertiary }]}
              >
                {formattedDate}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: themeColors.danger }]}>
            {formattedAmount}
          </Text>
        </View>
      </TouchableOpacity>
    </FadeInDown>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  noCategory: {
    fontSize: 12,
    fontStyle: "italic",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  amountContainer: {
    marginLeft: spacing.sm,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
  },
});
