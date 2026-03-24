import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { spacing, borderRadius } from "../../theme";
import { useColors } from "../../store/themeStore";
import type { ObjectiveStatus } from "../../types";

type ObjectiveStatusPickerProps = {
  value: ObjectiveStatus;
  onChange: (status: ObjectiveStatus) => void;
  error?: string;
};

const STATUS_OPTIONS: { id: ObjectiveStatus; label: string; color: string }[] =
  [
    { id: "ACTIVO", label: "Activo", color: "#10B981" },
    { id: "PAUSADO", label: "Pausado", color: "#F59E0B" },
    { id: "COMPLETADO", label: "Completado", color: "#6366F1" },
  ];

export const ObjectiveStatusPicker: React.FC<ObjectiveStatusPickerProps> = ({
  value,
  onChange,
  error,
}) => {
  const themeColors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: themeColors.text.primary }]}>
        Estado
      </Text>
      <View style={styles.optionsContainer}>
        {STATUS_OPTIONS.map((status) => {
          const isSelected = value === status.id;
          return (
            <TouchableOpacity
              key={status.id}
              testID={`status-${status.id.toLowerCase()}`}
              onPress={() => onChange(status.id)}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? status.color : themeColors.card,
                  borderColor: isSelected ? status.color : themeColors.border,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={status.label}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? "#fff" : themeColors.text.secondary },
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text style={[styles.error, { color: themeColors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
