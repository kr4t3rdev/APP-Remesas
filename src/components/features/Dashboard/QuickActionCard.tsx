import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors, borderRadius, spacing, shadows } from "../../../theme";

type QuickAction = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
};

type QuickActionCardProps = {
  actions: QuickAction[];
};

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  actions,
}) => {
  return (
    <View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.text.primary,
          marginBottom: spacing.sm,
        }}
      >
        Acciones Rápidas
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={action.onPress}
            style={{
              width: "48%",
              backgroundColor: colors.card,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              ...shadows.sm,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: borderRadius.md,
                backgroundColor: action.color + "20",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: spacing.sm,
              }}
            >
              <Text style={{ fontSize: 20 }}>{action.icon}</Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text.primary,
              }}
            >
              {action.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.text.secondary,
                marginTop: 2,
              }}
            >
              {action.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
