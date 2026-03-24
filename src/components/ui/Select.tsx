import React from "react";
import { Pressable, ScrollView, Text, View, ViewStyle } from "react-native";
import { borderRadius, spacing } from "../../theme";
import { useColors } from "../../store/themeStore";

export type SelectOption = {
  label: string;
  value: string;
  description?: string;
};

type SelectProps = {
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  loading?: boolean;
  error?: string | null;
  emptyText?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  testID?: string;
};

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Selecciona una opción",
  loading = false,
  error,
  emptyText = "Sin opciones disponibles",
  disabled = false,
  containerStyle,
  testID,
}) => {
  const themeColors = useColors();
  const selected = options.find((option) => option.value === value);

  const statusText = loading
    ? "Cargando opciones..."
    : error
      ? error
      : options.length === 0
        ? emptyText
        : null;

  return (
    <View style={containerStyle} testID={testID}>
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

      <View
        style={{
          backgroundColor: themeColors.background,
          borderRadius: borderRadius.md,
          borderWidth: 1,
          borderColor: error ? themeColors.danger : themeColors.border,
          padding: spacing.sm,
        }}
      >
        <Text
          style={{
            color: selected
              ? themeColors.text.primary
              : themeColors.text.secondary,
            marginBottom: statusText || options.length === 0 ? 0 : spacing.sm,
          }}
        >
          {selected?.label ?? placeholder}
        </Text>

        {statusText ? (
          <Text
            style={{
              color: error ? themeColors.danger : themeColors.text.secondary,
              fontSize: 12,
            }}
          >
            {statusText}
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}: ${option.label}`}
                  disabled={disabled}
                  onPress={() => onValueChange(option.value)}
                  style={{
                    minHeight: 44,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.full,
                    borderWidth: 1,
                    borderColor: isSelected
                      ? themeColors.primary[500]
                      : themeColors.border,
                    backgroundColor: isSelected
                      ? `${themeColors.primary[500]}22`
                      : themeColors.card,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: isSelected
                        ? themeColors.primary[600]
                        : themeColors.text.primary,
                      fontWeight: "600",
                    }}
                  >
                    {option.label}
                  </Text>
                  {option.description ? (
                    <Text
                      style={{
                        color: themeColors.text.secondary,
                        fontSize: 11,
                      }}
                    >
                      {option.description}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
};
