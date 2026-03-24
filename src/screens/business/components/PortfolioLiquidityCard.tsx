import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "../../../store/themeStore";
import { Ionicons } from "@expo/vector-icons";

export const PortfolioLiquidityCard = () => {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        PORTFOLIO LIQUIDITY
      </Text>
      <View style={styles.row}>
        <Text style={[styles.amount, { color: colors.text.primary }]}>
          $142,850
        </Text>
        <View style={styles.trendContainer}>
          <Ionicons name="trending-up" size={14} color="#10B981" />
          <Text style={styles.trendText}>+4.2%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
  },
  amount: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "700",
  },
});
