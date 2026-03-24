import React from "react";
import { View, TextInput, Text, TextInputProps, ViewStyle } from "react-native";
import { borderRadius, spacing } from "../../theme";
import { useColors } from "../../store/themeStore";

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
  const themeColors = useColors();

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: themeColors.text.primary,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            backgroundColor: themeColors.background,
            borderRadius: borderRadius.md,
            paddingVertical: 12,
            paddingHorizontal: spacing.md,
            fontSize: 16,
            color: themeColors.text.primary,
            borderWidth: 1,
            borderColor: error ? themeColors.danger : themeColors.border,
          },
          style,
        ]}
        placeholderTextColor={themeColors.text.secondary}
        {...props}
      />
      {error && (
        <Text
          style={{
            color: themeColors.danger,
            fontSize: 12,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
