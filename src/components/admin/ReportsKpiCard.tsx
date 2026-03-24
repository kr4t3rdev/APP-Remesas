import React, { useMemo, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScaleIn } from "../animations";
import { useColors, useShadows } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";

type KpiCardProps = {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: number;
  };
  loading?: boolean;
  delay?: number;
  variant?: "default" | "outlined";
  accentColor?: string;
};

export const ReportsKpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon,
  iconColor,
  trend,
  loading = false,
  delay = 50,
  variant = "default",
  accentColor,
}) => {
  const colors = useColors();
  const shadows = useShadows();

  // Custom styles based on props
  const customStyles = useMemo(() => {
    const baseCardStyle: any = {
      backgroundColor: colors.card,
      borderRadius: 24, // More rounded as per design
      padding: spacing.lg,
      flexDirection: "column", // Vertical layout
      alignItems: "flex-start",
      justifyContent: "space-between",
      minHeight: 140, // Taller cards
      flex: 1, // To fill grid column
    };

    if (variant === "outlined" && accentColor) {
      baseCardStyle.borderWidth = 1;
      baseCardStyle.borderColor = accentColor;
      baseCardStyle.backgroundColor = `${accentColor}10`; // Slight tint
    }

    return StyleSheet.create({
      container: baseCardStyle,
      title: {
        fontSize: 14,
        color:
          variant === "outlined" && accentColor
            ? accentColor
            : colors.text.secondary,
        fontWeight: "500",
        marginBottom: spacing.xs,
      },
      value: {
        fontSize: 32,
        fontWeight: "700",
        color:
          variant === "outlined" && accentColor
            ? accentColor
            : colors.text.primary,
        marginVertical: spacing.sm,
      },
      trendRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "transparent",
      },
      trendText: {
        fontSize: 14,
        fontWeight: "600",
      },
    });
  }, [colors, variant, accentColor]);

  // Animated number effect
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading) {
      animatedValue.setValue(0);
      return;
    }

    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: animatedVal }) => {
      setDisplayValue(animatedVal);
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, loading, animatedValue]);

  const formatValue = (num: number) => {
    const formatted =
      decimals > 0
        ? num.toFixed(decimals)
        : Math.round(num).toLocaleString("es-ES");
    return `${prefix}${formatted}${suffix}`;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.direction === "up"
      ? "trending-up"
      : trend.direction === "down"
        ? "trending-down"
        : "remove";
  };

  const getTrendColor = () => {
    if (!trend) return colors.text.secondary;
    return trend.direction === "up"
      ? colors.success
      : trend.direction === "down"
        ? colors.danger
        : colors.text.secondary;
  };

  if (loading) {
    return (
      <ScaleIn delay={delay}>
        <View style={customStyles.container}>
          <View
            style={{
              height: 20,
              width: "60%",
              backgroundColor: colors.border,
              borderRadius: 4,
              opacity: 0.3,
            }}
          />
          <View
            style={{
              height: 40,
              width: "80%",
              backgroundColor: colors.border,
              borderRadius: 4,
              opacity: 0.3,
              marginTop: 10,
            }}
          />
        </View>
      </ScaleIn>
    );
  }

  return (
    <ScaleIn delay={delay}>
      <View style={customStyles.container}>
        <Text style={customStyles.title}>{title}</Text>
        <Text style={customStyles.value}>{formatValue(displayValue)}</Text>

        {trend && (
          <View style={customStyles.trendRow}>
            <Ionicons
              name={getTrendIcon()!}
              size={16}
              color={getTrendColor()}
            />
            <Text style={[customStyles.trendText, { color: getTrendColor() }]}>
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
    </ScaleIn>
  );
};
