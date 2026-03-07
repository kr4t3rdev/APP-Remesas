import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInDown } from '../animations';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';

type PlanFilterProps = {
  selectedPlanId?: number;
  onPlanChange: (planId: number | undefined) => void;
  plans?: Array<{ id: number; name: string }>;
  delay?: number;
};

const defaultPlans = [
  { id: 1, name: 'Básico' },
  { id: 2, name: 'Premium' },
  { id: 3, name: 'Empresarial' },
];

export const PlanFilter: React.FC<PlanFilterProps> = ({
  selectedPlanId,
  onPlanChange,
  plans = defaultPlans,
  delay = 80,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePlanSelect = (planId: number | undefined) => {
    onPlanChange(planId === selectedPlanId ? undefined : planId);
  };

  return (
    <FadeInDown delay={delay + 20} duration={300}>
      <View style={styles.container}>
        <Text style={styles.label}>Plan</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plansRow}
        >
          <TouchableOpacity
            style={[styles.planChip, !selectedPlanId && styles.planChipActive]}
            onPress={() => onPlanChange(undefined)}
            accessibilityRole="button"
            accessibilityLabel="Todos los planes"
          >
            <Text style={[styles.planText, !selectedPlanId && styles.planTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>

          {plans.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planChip, isSelected && styles.planChipActive]}
                onPress={() => handlePlanSelect(plan.id)}
                accessibilityRole="button"
                accessibilityLabel={`Plan ${plan.name}`}
              >
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={isSelected ? colors.primary[500] : colors.text.secondary}
                />
                <Text style={[styles.planText, isSelected && styles.planTextActive]}>
                  {plan.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </FadeInDown>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    plansRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    planChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 36,
    },
    planChipActive: {
      backgroundColor: `${colors.primary[500]}16`,
      borderColor: colors.primary[500],
    },
    planText: {
      fontSize: 13,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    planTextActive: {
      color: colors.primary[500],
    },
  });
