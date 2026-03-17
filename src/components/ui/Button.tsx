import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { borderRadius } from '../../theme';
import { useColors } from '../../store/themeStore';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  testID?: string;
  accessibilityLabel?: string;
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  testID,
  accessibilityLabel,
}) => {
  const colors = useColors();

  const getVariantStyles = (variant: ButtonVariant): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary[500] };
      case 'secondary':
        return { backgroundColor: colors.primary[100] };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary[500] };
      case 'ghost':
        return { backgroundColor: 'transparent' };
    }
  };

  const getSizeStyles = (size: ButtonSize): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'md':
        return { paddingVertical: 12, paddingHorizontal: 24 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 32 };
    }
  };

  const getTextColor = (variant: ButtonVariant): string => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.primary[700];
      case 'outline':
        return colors.primary[500];
      case 'ghost':
        return colors.primary[500];
    }
  };

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          borderRadius: borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        },
        getVariantStyles(variant),
        getSizeStyles(size),
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor(variant)} />
      ) : (
        <Text
          style={[
            {
              fontSize: size === 'sm' ? 14 : 16,
              fontWeight: '600',
              color: getTextColor(variant),
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
