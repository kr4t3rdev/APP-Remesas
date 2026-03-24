import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { colors, borderRadius, spacing } from "../../theme";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";

type BadgeProps = {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
};

const getVariantStyles = (
  variant: BadgeVariant,
): { bg: string; text: string } => {
  switch (variant) {
    case "success":
      return { bg: colors.success + "20", text: colors.success };
    case "warning":
      return { bg: colors.warning + "20", text: colors.warning };
    case "danger":
      return { bg: colors.danger + "20", text: colors.danger };
    case "info":
      return { bg: colors.primary[100], text: colors.primary[700] };
    default:
      return { bg: colors.border, text: colors.text.secondary };
  }
};

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = "default",
  style,
}) => {
  const variantStyles = getVariantStyles(variant);

  return (
    <View
      style={[
        {
          backgroundColor: variantStyles.bg,
          borderRadius: borderRadius.full,
          paddingVertical: 4,
          paddingHorizontal: spacing.sm,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "500",
          color: variantStyles.text,
        }}
      >
        {text}
      </Text>
    </View>
  );
};
