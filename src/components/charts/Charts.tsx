import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated, Easing, StyleProp } from 'react-native';
import { FadeIn } from '../animations';
import { colors, spacing, borderRadius, shadows } from '../../theme';

type BarChartProps = {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

type BarItemProps = {
  value: number;
  maxValue: number;
  height: number;
  color: string;
  index: number;
  animated: boolean;
  showValue: boolean;
  showLabel: boolean;
  label: string;
};

const BarItem: React.FC<BarItemProps> = ({
  value,
  maxValue,
  height,
  color,
  index,
  animated,
  showValue,
  showLabel,
  label,
}) => {
  const barHeight = (value / maxValue) * height;
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.spring(animatedHeight, {
          toValue: barHeight,
          friction: 7,
          tension: 40,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      animatedHeight.setValue(barHeight);
    }
  }, [barHeight, animated, animatedHeight, index]);

  return (
    <View style={styles.barWrapper}>
      {showValue && (
        <Text style={styles.barValue}>
          {value.toLocaleString()}
        </Text>
      )}
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: color,
            height: animatedHeight,
          },
        ]}
      />
      {showLabel && (
        <Text style={styles.barLabel} numberOfLines={1}>
          {label}
        </Text>
      )}
    </View>
  );
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  height = 120,
  showLabels = true,
  showValues = true,
  animated = true,
  style,
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <FadeIn style={[styles.chartContainer, style]}>
      <View style={[styles.barsContainer, { height }]}>
        {data.map((item, index) => (
          <BarItem
            key={index}
            value={item.value}
            maxValue={max}
            height={height}
            color={item.color || colors.primary[500]}
            index={index}
            animated={animated}
            showValue={showValues}
            showLabel={showLabels}
            label={item.label}
          />
        ))}
      </View>
    </FadeIn>
  );
};

type HorizontalBarItemProps = {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  index: number;
  animated: boolean;
};

const HorizontalBarItem: React.FC<HorizontalBarItemProps> = ({
  label,
  value,
  maxValue,
  color,
  index,
  animated,
}) => {
  const percentage = (value / maxValue) * 100;
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.timing(animatedWidth, {
          toValue: percentage,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      animatedWidth.setValue(percentage);
    }
  }, [percentage, animated, animatedWidth, index]);

  return (
    <View style={styles.horizontalBarWrapper}>
      <View style={styles.horizontalBarHeader}>
        <Text style={styles.horizontalBarLabel}>{label}</Text>
        <Text style={styles.horizontalBarValue}>
          {percentage.toFixed(1)}%
        </Text>
      </View>
      <View style={styles.horizontalBarBackground}>
        <Animated.View
          style={[
            styles.horizontalBar,
            { backgroundColor: color, width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }) },
          ]}
        />
      </View>
    </View>
  );
};

type HorizontalBarChartProps = {
  data: { label: string; value: number; color?: string; percentage?: number }[];
  maxValue?: number;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  maxValue,
  animated = true,
  style,
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <FadeIn style={[styles.horizontalChartContainer, style]}>
      {data.map((item, index) => (
        <HorizontalBarItem
          key={index}
          label={item.label}
          value={item.value}
          maxValue={max}
          color={item.color || colors.primary[500]}
          index={index}
          animated={animated}
        />
      ))}
    </FadeIn>
  );
};

type CircularProgressProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = colors.primary[500],
  backgroundColor = colors.border,
  animated = true,
  children,
  style,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(rotation, {
        toValue: percentage,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      rotation.setValue(percentage);
    }
  }, [percentage, animated, rotation]);

  const rotateDeg = rotation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <FadeIn style={[{ width: size, height: size }, style]}>
      <View style={[styles.circularContainer, { width: size, height: size }]}>
        <View
          style={[
            styles.circularBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />
        <View style={styles.circularContent}>
          {children || (
            <Text style={styles.circularPercentage}>{percentage.toFixed(0)}%</Text>
          )}
        </View>
      </View>
    </FadeIn>
  );
};

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = colors.primary[500],
  animated = true,
  style,
}) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(1);
      opacity.setValue(1);
    }
  }, [animated, scale, opacity]);

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return colors.success;
      case 'down': return colors.danger;
      default: return colors.text.secondary;
    }
  };

  return (
    <Animated.View style={[styles.statsCard, shadows.md, { transform: [{ scale }], opacity }, style]}>
      {icon && <View style={[styles.statsIconContainer, { backgroundColor: `${color}15` }]}>{icon}</View>}
      <Text style={styles.statsTitle}>{title}</Text>
      <Text style={[styles.statsValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trendValue, { color: getTrendColor() }]}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

type MiniChartProps = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  color = colors.primary[500],
  width = 80,
  height = 30,
  style,
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <View style={[{ width, height }, style]}>
      <View style={styles.miniChartContainer}>
        {data.map((value, index) => {
          const barHeight = ((value - min) / range) * height * 0.8;
          return (
            <View
              key={index}
              style={[
                styles.miniChartBar,
                {
                  height: barHeight,
                  backgroundColor: color,
                  marginLeft: index === 0 ? 0 : 2,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    paddingVertical: spacing.sm,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  bar: {
    width: '100%',
    maxWidth: 40,
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  horizontalChartContainer: {
    gap: spacing.md,
  },
  horizontalBarWrapper: {
    gap: 6,
  },
  horizontalBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalBarLabel: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
  },
  horizontalBarValue: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  horizontalBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  horizontalBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularBackground: {
    position: 'absolute',
  },
  circularContent: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  circularPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flex: 1,
    minWidth: 140,
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statsTitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statsSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  trendContainer: {
    marginTop: spacing.xs,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  miniChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  miniChartBar: {
    flex: 1,
    borderRadius: 2,
  },
});
