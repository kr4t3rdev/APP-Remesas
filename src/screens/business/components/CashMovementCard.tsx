import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "../../../store/themeStore";
import { Ionicons } from "@expo/vector-icons";

interface CashMovement {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  badgeLabel: string;
  currencySymbol?: string;
}

interface Props {
  movement: CashMovement;
}

export const CashMovementCard = ({ movement }: Props) => {
  const colors = useColors();

  const isIncome = movement.type === "INCOME";
  const isTransfer = movement.type === "TRANSFER";
  const isExpense = movement.type === "EXPENSE";

  let iconName: any = "remove";
  let iconColor = "#EF4444"; // red
  let iconBgColor = "#FEE2E2";
  let amountColor = colors.text.primary;
  let amountPrefix = "-";

  if (isIncome) {
    iconName = "add";
    iconColor = "#10B981"; // green
    iconBgColor = "#D1FAE5";
    amountColor = "#10B981";
    amountPrefix = "+";
  } else if (isTransfer) {
    iconName = "cash-outline";
    iconColor = "#EF4444";
    iconBgColor = "#FEE2E2";
    amountPrefix = "-";
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>

      <View style={styles.contentContainer}>
        <Text
          style={[styles.title, { color: colors.text.primary }]}
          numberOfLines={2}
        >
          {movement.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          {movement.subtitle}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}{movement.currencySymbol ?? "$"}
          {Math.abs(movement.amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: isIncome ? "#D1FAE5" : "#E5E7EB" },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isIncome ? "#065F46" : "#374151" },
            ]}
          >
            {movement.badgeLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
