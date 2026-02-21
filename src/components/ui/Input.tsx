import React from 'react';
import { View, TextInput, Text, TextInputProps, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../../theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: colors.text.primary,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            backgroundColor: colors.background,
            borderRadius: borderRadius.md,
            paddingVertical: 12,
            paddingHorizontal: spacing.md,
            fontSize: 16,
            color: colors.text.primary,
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
          },
          style,
        ]}
        placeholderTextColor={colors.text.secondary}
        {...props}
      />
      {error && (
        <Text style={{ color: colors.danger, fontSize: 12, marginTop: spacing.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
};
