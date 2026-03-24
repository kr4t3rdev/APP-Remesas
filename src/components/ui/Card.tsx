import React from "react";
import {
  View,
  Text,
  ViewStyle,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { borderRadius, spacing } from "../../theme";
import { useColors, useShadows, useIsDark } from "../../store/themeStore";

type CardVariant = "default" | "glass" | "gradient" | "elevated";

type CardProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: CardVariant;
  gradientColors?: string[];
  glowColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
};

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = "default",
  gradientColors,
  glowColor,
  style,
  onPress,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const isDark = useIsDark();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    };

    switch (variant) {
      case "elevated":
        return {
          ...baseStyle,
          backgroundColor: colors.card,
          ...shadows.lg,
        };
      case "glass":
        return {
          ...baseStyle,
          backgroundColor: isDark
            ? "rgba(30, 41, 59, 0.8)"
            : "rgba(255, 255, 255, 0.9)",
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
          ...shadows.md,
        };
      case "gradient":
        return {
          ...baseStyle,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: gradientColors
            ? gradientColors[0] + "30"
            : colors.primary[500] + "30",
          ...shadows.glow,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.card,
          ...shadows.sm,
        };
    }
  };

  const content = (
    <>
      {(title || subtitle) && (
        <View style={{ marginBottom: spacing.sm }}>
          {title && (
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text.primary,
              }}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={{
                fontSize: 14,
                color: colors.text.secondary,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{content}</View>;
};

const styles = StyleSheet.create({});
