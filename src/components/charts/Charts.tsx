import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
  StyleProp,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { FadeIn, useReducedMotion } from "../animations";
import { colors, spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getSafePositiveMax = (values: number[], requestedMax?: number) => {
  const highestPositiveValue = values.reduce(
    (highest, value) =>
      Number.isFinite(value) ? Math.max(highest, value) : highest,
    0,
  );
  const safeRequestedMax =
    requestedMax !== undefined && Number.isFinite(requestedMax)
      ? requestedMax
      : 0;

  return Math.max(highestPositiveValue, safeRequestedMax, 1);
};

const getSafeHorizontalMax = (values: number[], requestedMax?: number) => {
  if (
    requestedMax !== undefined &&
    Number.isFinite(requestedMax) &&
    requestedMax > 0
  ) {
    return requestedMax;
  }

  return getSafePositiveMax(values);
};

const formatProgressPercentage = (percentage: number) => {
  if (percentage >= 100) return "100";
  if (percentage <= 0) return "0";

  const conservativeTenth = Math.floor((percentage + Number.EPSILON) * 10) / 10;
  return Number.isInteger(conservativeTenth)
    ? conservativeTenth.toFixed(0)
    : conservativeTenth.toFixed(1);
};

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
  valueColor: string;
  labelColor: string;
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
  valueColor,
  labelColor,
}) => {
  const reducedMotion = useReducedMotion();
  const displayValue = value.toLocaleString();
  const visualValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  const barHeight = clamp((visualValue / maxValue) * height, 0, height);
  const animatedHeight = useRef(
    new Animated.Value(animated && reducedMotion === false ? 0 : barHeight),
  ).current;

  useEffect(() => {
    animatedHeight.stopAnimation();

    if (animated && reducedMotion === false) {
      Animated.timing(animatedHeight, {
        toValue: barHeight,
        duration: 220,
        delay: index * 60,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      return () => animatedHeight.stopAnimation();
    }

    animatedHeight.setValue(barHeight);
  }, [animated, animatedHeight, barHeight, index, reducedMotion]);

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${displayValue}`}
      style={styles.barWrapper}
    >
      {showValue && (
        <Text style={[styles.barValue, { color: valueColor }]}>
          {displayValue}
        </Text>
      )}
      <Animated.View
        testID={`bar-chart-bar-${index}`}
        style={[
          styles.bar,
          {
            backgroundColor: color,
            height: animatedHeight,
          },
        ]}
      />
      {showLabel && (
        <Text
          style={[styles.barLabel, { color: labelColor }]}
          numberOfLines={1}
        >
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
  const themeColors = useColors();
  const max = getSafePositiveMax(
    data.map((item) => item.value),
    maxValue,
  );

  if (data.length === 0) {
    return (
      <FadeIn style={[styles.chartContainer, style]}>
        <View style={[styles.emptyChart, { height }]}>
          <Text
            style={[
              styles.emptyChartText,
              { color: themeColors.text.secondary },
            ]}
          >
            Sin datos para mostrar
          </Text>
        </View>
      </FadeIn>
    );
  }

  return (
    <FadeIn style={[styles.chartContainer, style]}>
      <View style={[styles.barsContainer, { height }]}>
        {data.map((item, index) => (
          <BarItem
            key={index}
            value={item.value}
            maxValue={max}
            height={height}
            color={item.color || themeColors.primary[500]}
            index={index}
            animated={animated}
            showValue={showValues}
            showLabel={showLabels}
            label={item.label}
            valueColor={themeColors.text.primary}
            labelColor={themeColors.text.secondary}
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
  labelColor: string;
  valueColor: string;
  trackColor: string;
};

const HorizontalBarItem: React.FC<HorizontalBarItemProps> = ({
  label,
  value,
  maxValue,
  color,
  index,
  animated,
  labelColor,
  valueColor,
  trackColor,
}) => {
  const reducedMotion = useReducedMotion();
  const displayPercentage = (value / maxValue) * 100;
  const formattedPercentage = `${displayPercentage.toFixed(1)}%`;
  const visualPercentage = clamp(displayPercentage, 0, 100);
  const animatedWidth = useRef(
    new Animated.Value(
      animated && reducedMotion === false ? 0 : visualPercentage,
    ),
  ).current;

  useEffect(() => {
    animatedWidth.stopAnimation();

    if (animated && reducedMotion === false) {
      Animated.timing(animatedWidth, {
        toValue: visualPercentage,
        duration: 220,
        delay: index * 60,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      return () => animatedWidth.stopAnimation();
    }

    animatedWidth.setValue(visualPercentage);
  }, [animated, animatedWidth, index, reducedMotion, visualPercentage]);

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${formattedPercentage}`}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: visualPercentage,
        text: formattedPercentage,
      }}
      style={styles.horizontalBarWrapper}
    >
      <View style={styles.horizontalBarHeader}>
        <Text style={[styles.horizontalBarLabel, { color: labelColor }]}>
          {label}
        </Text>
        <Text style={[styles.horizontalBarValue, { color: valueColor }]}>
          {formattedPercentage}
        </Text>
      </View>
      <View
        testID={`horizontal-bar-track-${index}`}
        style={[
          styles.horizontalBarBackground,
          { backgroundColor: trackColor },
        ]}
      >
        <Animated.View
          testID={`horizontal-bar-fill-${index}`}
          style={[
            styles.horizontalBar,
            {
              backgroundColor: color,
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
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
  const themeColors = useColors();
  const max = getSafeHorizontalMax(
    data.map((item) => item.value),
    maxValue,
  );

  return (
    <FadeIn style={[styles.horizontalChartContainer, style]}>
      {data.map((item, index) => (
        <HorizontalBarItem
          key={index}
          label={item.label}
          value={item.value}
          maxValue={max}
          color={item.color || themeColors.primary[500]}
          index={index}
          animated={animated}
          labelColor={themeColors.text.primary}
          valueColor={themeColors.text.secondary}
          trackColor={themeColors.border}
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
  color,
  backgroundColor,
  animated = true,
  children,
  style,
}) => {
  const reducedMotion = useReducedMotion();
  const themeColors = useColors();
  const progressBackgroundColor = backgroundColor ?? themeColors.border;
  const progressColor = color ?? themeColors.primary[500];
  const clampedPercentage = Number.isFinite(percentage)
    ? Math.min(100, Math.max(0, percentage))
    : 0;
  const radius = Math.max(0, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedPercentage / 100);
  const isComplete = clampedPercentage === 100;
  const displayedPercentage = formatProgressPercentage(clampedPercentage);
  const animatedStrokeDashoffset = useRef(
    new Animated.Value(
      animated && reducedMotion === false ? circumference : strokeDashoffset,
    ),
  ).current;

  useEffect(() => {
    animatedStrokeDashoffset.stopAnimation();

    if (animated && reducedMotion === false) {
      Animated.timing(animatedStrokeDashoffset, {
        toValue: strokeDashoffset,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      return () => animatedStrokeDashoffset.stopAnimation();
    }

    animatedStrokeDashoffset.setValue(strokeDashoffset);
  }, [animated, animatedStrokeDashoffset, reducedMotion, strokeDashoffset]);

  return (
    <FadeIn style={[{ width: size, height: size }, style]}>
      <View style={[styles.circularContainer, { width: size, height: size }]}>
        <Svg
          accessibilityRole="progressbar"
          accessibilityLabel={`Progreso: ${displayedPercentage}%${
            isComplete ? ", completado" : ""
          }`}
          accessibilityValue={{
            min: 0,
            max: 100,
            now: clampedPercentage,
            text: isComplete ? "Completado" : `${displayedPercentage}%`,
          }}
          width={size}
          height={size}
          style={styles.circularGraphic}
        >
          <Circle
            testID="circular-progress-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressBackgroundColor}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            testID="circular-progress-arc"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={animatedStrokeDashoffset}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.circularContent}>
          {children || (
            <Text
              style={[
                styles.circularPercentage,
                { color: themeColors.text.primary },
              ]}
            >
              {displayedPercentage}%
            </Text>
          )}
        </View>
      </View>
    </FadeIn>
  );
};

type DonutSegment = {
  value: number;
  color: string;
  label?: string;
};

type DonutChartProps = {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 140,
  strokeWidth = 24,
  children,
  style,
}) => {
  const themeColors = useColors();
  const radius = Math.max(0, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, s) => sum + s.value, 0);

  if (data.length === 0 || total <= 0) {
    return (
      <FadeIn style={[{ width: size, height: size }, style]}>
        <View style={[styles.donutContainer, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={themeColors.border} strokeWidth={strokeWidth} />
          </Svg>
          <Text style={[styles.donutEmptyText, { color: themeColors.text.secondary }]}>Sin datos</Text>
        </View>
      </FadeIn>
    );
  }

  let cumulative = 0;

  return (
    <FadeIn style={[{ width: size, height: size }, style]}>
      <View style={[styles.donutContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.donutGraphic}>
          <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={themeColors.border} strokeWidth={strokeWidth} />
          {data.map((segment, index) => {
            const segLen = (segment.value / total) * circumference;
            const offset = circumference - cumulative;
            cumulative += segLen;

            return (
              <Circle
                key={segment.label ?? index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={`${segLen} ${circumference - segLen}`}
                strokeDashoffset={offset}
                rotation={-90}
                origin={`${size / 2}, ${size / 2}`}
              />
            );
          })}
        </Svg>
        {children && (
          <View style={styles.donutContent}>
            {children}
          </View>
        )}
      </View>
    </FadeIn>
  );
};

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
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
  testID,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const reducedMotion = useReducedMotion();

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const initialReducedMotion = useRef(reducedMotion);
  const hasInitializedMotion = useRef(false);
  const previousAnimated = useRef(animated);

  useEffect(() => {
    if (reducedMotion === null) return;

    const isInitialPreferenceResolution = !hasInitializedMotion.current;
    const animatedChanged = animated !== previousAnimated.current;
    hasInitializedMotion.current = true;
    previousAnimated.current = animated;

    if (
      (isInitialPreferenceResolution && initialReducedMotion.current === null) ||
      !animatedChanged && !isInitialPreferenceResolution
    ) {
      scale.setValue(1);
      opacity.setValue(1);
      return;
    }

    if (animated && reducedMotion === false) {
      scale.setValue(0.96);
      opacity.setValue(0);
      const animation = Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      animation.start();
      return () => animation.stop();
    }

    scale.setValue(1);
    opacity.setValue(1);
  }, [animated, scale, opacity, reducedMotion]);

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return themeColors.success;
      case "down":
        return themeColors.danger;
      default:
        return themeColors.text.secondary;
    }
  };

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.statsCard,
        {
          backgroundColor: themeColors.card,
          transform: [{ scale }],
          opacity,
        },
        themeShadows.md,
        style,
      ]}
    >
      {icon && (
        <View
          style={[styles.statsIconContainer, { backgroundColor: `${color}15` }]}
        >
          {icon}
        </View>
      )}
      <Text style={[styles.statsTitle, { color: themeColors.text.secondary }]}>
        {title}
      </Text>
      <Text style={[styles.statsValue, { color }]}>{value}</Text>
      {subtitle && (
        <Text
          style={[styles.statsSubtitle, { color: themeColors.text.tertiary }]}
        >
          {subtitle}
        </Text>
      )}
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trendValue, { color: getTrendColor() }]}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : ""} {trendValue}
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
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: spacing.sm,
  },
  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChartText: {
    fontSize: 13,
  },
  barWrapper: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 4,
  },
  bar: {
    width: "100%",
    maxWidth: 40,
    borderRadius: borderRadius.sm,
  },
  barValue: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  horizontalChartContainer: {
    gap: spacing.md,
  },
  horizontalBarWrapper: {
    gap: 6,
  },
  horizontalBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  horizontalBarLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  horizontalBarValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  horizontalBarBackground: {
    height: 8,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  horizontalBar: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  circularContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  circularGraphic: {
    position: "absolute",
  },
  circularContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },
  circularPercentage: {
    fontSize: 24,
    fontWeight: "700",
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statsTitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: "700",
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
    fontWeight: "600",
  },
  miniChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
  },
  miniChartBar: {
    flex: 1,
    borderRadius: 2,
  },
  donutContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  donutGraphic: {
    position: "absolute",
  },
  donutContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },
  donutEmptyText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
