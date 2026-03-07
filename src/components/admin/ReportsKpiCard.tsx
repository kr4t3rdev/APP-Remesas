import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScaleIn } from '../animations';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';

type KpiCardProps = {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
  };
  loading?: boolean;
  delay?: number;
};

export const ReportsKpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon,
  iconColor,
  trend,
  loading = false,
  delay = 50,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows, iconColor || colors.primary[500]), [
    colors,
    shadows,
    iconColor,
  ]);

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
    const formatted = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toLocaleString('es-ES');
    return `${prefix}${formatted}${suffix}`;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.direction === 'up' ? 'trending-up' : trend.direction === 'down' ? 'trending-down' : 'remove';
  };

  const getTrendColor = () => {
    if (!trend) return colors.text.secondary;
    return trend.direction === 'up'
      ? colors.success
      : trend.direction === 'down'
      ? colors.danger
      : colors.text.secondary;
  };

  if (loading) {
    return (
      <ScaleIn delay={delay}>
        <View style={styles.container}>
          <View style={styles.skeleton} />
        </View>
      </ScaleIn>
    );
  }

  return (
    <ScaleIn delay={delay}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={styles.iconColor.color} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{formatValue(displayValue)}</Text>

          {trend && (
            <View style={styles.trendRow}>
              <Ionicons name={getTrendIcon()!} size={14} color={getTrendColor()} />
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {trend.value}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScaleIn>
  );
};

// Need to import useState
// import { useState } from 'react';

const createStyles = (
  colors: ReturnType<typeof useColors>,
  shadows: ReturnType<typeof useShadows>,
  iconColor: string,
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      ...shadows.sm,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: `${iconColor}16`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: {
      color: iconColor,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 12,
      color: colors.text.secondary,
      fontWeight: '500',
      marginBottom: 2,
    },
    value: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text.primary,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginTop: 4,
    },
    trendText: {
      fontSize: 12,
      fontWeight: '600',
    },
    skeleton: {
      height: 80,
      backgroundColor: colors.border,
      borderRadius: borderRadius.md,
      opacity: 0.3,
    },
  });
