import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../theme';

type CardProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
};

export const Card: React.FC<CardProps> = ({ children, title, subtitle, style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          ...shadows.sm,
        },
        style,
      ]}
    >
      {(title || subtitle) && (
        <View style={{ marginBottom: spacing.sm }}>
          {title && (
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text.primary }}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
};
