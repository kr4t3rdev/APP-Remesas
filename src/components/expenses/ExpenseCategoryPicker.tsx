import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { useColors } from '../../store/themeStore';
import type { ExpenseCategory } from '../../types';

type ExpenseCategoryPickerProps = {
  value: ExpenseCategory;
  onChange: (category: ExpenseCategory) => void;
  error?: string;
};

const CATEGORIES: { id: ExpenseCategory; label: string; icon: string; color: string }[] = [
  { id: 'renta', label: 'Renta', icon: 'home', color: '#EF4444' },
  { id: 'servicios', label: 'Servicios', icon: 'bulb', color: '#F59E0B' },
  { id: 'salario', label: 'Salario', icon: 'people', color: '#10B981' },
  { id: 'insumos', label: 'Insumos', icon: 'cube', color: '#6366F1' },
  { id: 'otros', label: 'Otros', icon: 'ellipsis-horizontal', color: '#64748B' },
];

export const ExpenseCategoryPicker: React.FC<ExpenseCategoryPickerProps> = ({
  value,
  onChange,
  error,
}) => {
  const themeColors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: themeColors.text.primary }]}>Categoría</Text>
      <View style={styles.chipsContainer}>
        {CATEGORIES.map((cat) => {
          const isSelected = value === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              testID={`category-${cat.id}`}
              onPress={() => onChange(cat.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? cat.color : themeColors.card,
                  borderColor: isSelected ? cat.color : themeColors.border,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={cat.label}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={isSelected ? '#fff' : cat.color}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? '#fff' : themeColors.text.secondary },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text style={[styles.error, { color: themeColors.danger }]}>{error}</Text>
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
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 6,
    minWidth: 44,
    minHeight: 44,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
