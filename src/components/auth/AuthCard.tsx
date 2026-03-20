import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, borderRadius, shadows } from '../../theme';
import { useColors } from '../../store/themeStore';

interface AuthCardProps {
  children: React.ReactNode;
  maxWidth?: number;
  style?: ViewStyle;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  maxWidth = 420,
  style,
}) => {
  const colors = useColors();

  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card,
          maxWidth,
          ...shadows.md,
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
});

export default AuthCard;
