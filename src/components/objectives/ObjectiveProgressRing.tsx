import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../../theme';

type ObjectiveProgressRingProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
};

export const ObjectiveProgressRing: React.FC<ObjectiveProgressRingProps> = ({
  percentage,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
}) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  const getColor = () => {
    if (clampedPercentage >= 100) return '#10B981';
    if (clampedPercentage >= 75) return '#6366F1';
    if (clampedPercentage >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const progressColor = getColor();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.svgContainer}>
        <View
          style={[
            styles.backgroundCircle,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: '#E5E7EB',
            },
          ]}
        />
        <View
          style={[
            styles.progressArc,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: progressColor,
              borderTopColor: clampedPercentage > 25 ? progressColor : 'transparent',
              borderRightColor: clampedPercentage > 50 ? progressColor : 'transparent',
              borderBottomColor: clampedPercentage > 75 ? progressColor : 'transparent',
              borderLeftColor: clampedPercentage > 0 ? progressColor : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.percentageText, { color: progressColor }]}>
            {clampedPercentage.toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
  },
  progressArc: {
    position: 'absolute',
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
