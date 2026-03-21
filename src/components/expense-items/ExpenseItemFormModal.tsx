import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInDown } from '../animations';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { spacing, borderRadius } from '../../theme';
import { useColors, useShadows } from '../../store/themeStore';
import type {
  ExpenseItem,
  CreateExpenseItemInput,
} from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ExpenseItemFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseItemInput) => Promise<void>;
  expense?: ExpenseItem | null;
  isLoading?: boolean;
  categories?: string[];
};

export const ExpenseItemFormModal: React.FC<ExpenseItemFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  expense,
  isLoading = false,
  categories = [],
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!expense;

  useEffect(() => {
    if (visible) {
      if (expense) {
        setName(expense.name);
        setAmount(parseFloat(expense.amount).toFixed(2));
        setCategory(expense.category || '');
      } else {
        setName('');
        setAmount('');
        setCategory('');
      }
      setErrors({});
      setShowCategoryPicker(false);
    }
  }, [visible, expense]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!amount || Number(amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a cero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateExpenseItemInput = {
        name: name.trim(),
        amount: Number(Number(amount).toFixed(2)),
        category: category.trim() || undefined,
      };

      console.log('Payload a enviar:', JSON.stringify(payload, null, 2));
      
      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      console.error('Error al guardar gasto:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'No se pudo guardar el gasto. Intenta de nuevo.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCategory = (cat: string) => {
    setCategory(cat);
    setShowCategoryPicker(false);
  };

  const handleClearCategory = () => {
    setCategory('');
    setShowCategoryPicker(false);
  };

  // Calcular altura del modal (80% de la pantalla o mínimo 400)
  const modalHeight = Math.max(SCREEN_HEIGHT * 0.5, 400);
  const contentHeight = modalHeight - 140; // Header + Footer

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.wrapper, { paddingBottom: insets.bottom || spacing.md }]}>
          <FadeInDown>
            <View style={[
              styles.container, 
              { 
                backgroundColor: themeColors.card, 
                maxHeight: modalHeight,
              }, 
              themeShadows.lg
            ]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text.primary }]}>
                  {isEditing ? 'Editar Gasto' : '+ Nuevo Gasto'}
                </Text>
                <TouchableOpacity testID="close-expense-item-modal" onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={themeColors.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={[styles.content, { maxHeight: contentHeight }]} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Input
                  testID="expense-item-name-input"
                  label="Nombre *"
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej: Arrendamientos de Inmuebles"
                  error={errors.name}
                />

                <View style={styles.amountContainer}>
                  <Text style={[styles.currencySymbol, { color: themeColors.text.secondary }]}>$</Text>
                  <Input
                    testID="expense-item-amount-input"
                    label="Monto *"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    error={errors.amount}
                    containerStyle={styles.amountInput}
                  />
                </View>

                <View style={styles.categorySection}>
                  <Text style={[styles.categoryLabel, { color: themeColors.text.primary }]}>
                    Categoría (opcional)
                  </Text>
                  
                  {!showCategoryPicker ? (
                    <TouchableOpacity
                      testID="expense-item-category-picker-button"
                      onPress={() => setShowCategoryPicker(true)}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: themeColors.background,
                          borderColor: errors.category ? themeColors.danger : themeColors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          { color: category ? themeColors.text.primary : themeColors.text.secondary },
                        ]}
                      >
                        {category || 'Seleccionar categoría'}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={themeColors.text.secondary}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={[
                        styles.categoryPicker,
                        { backgroundColor: themeColors.background, borderColor: themeColors.border },
                      ]}
                    >
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            testID={`category-option-${cat}`}
                            onPress={() => handleSelectCategory(cat)}
                            style={[
                              styles.categoryOption,
                              category === cat && { backgroundColor: `${themeColors.primary[500]}20` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.categoryOptionText,
                                { color: themeColors.text.primary },
                                category === cat && { color: themeColors.primary[500], fontWeight: '600' },
                              ]}
                            >
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={[styles.noCategoriesText, { color: themeColors.text.secondary }]}>
                          No hay categorías guardadas
                        </Text>
                      )}
                      <TouchableOpacity
                        testID="new-category-button"
                        onPress={() => {
                          setShowCategoryPicker(false);
                        }}
                        style={[styles.newCategoryButton, { borderColor: themeColors.border }]}
                      >
                        <Ionicons name="add" size={18} color={themeColors.primary[500]} />
                        <Text style={[styles.newCategoryText, { color: themeColors.primary[500] }]}>
                          Crear nueva categoría
                        </Text>
                      </TouchableOpacity>
                      {category && (
                        <TouchableOpacity
                          testID="clear-category-button"
                          onPress={handleClearCategory}
                          style={styles.clearCategoryButton}
                        >
                          <Text style={[styles.clearCategoryText, { color: themeColors.danger }]}>
                            Quitar categoría
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
                
                {/* Espacio extra para que no quede pegado al footer */}
                <View style={{ height: spacing.xl }} />
              </ScrollView>

              <View style={[styles.footer, { paddingBottom: spacing.md }]}>
                <Button
                  testID="expense-item-cancel-button"
                  title="Cancelar"
                  variant="outline"
                  onPress={onClose}
                  style={{ flex: 1 }}
                />
                <Button
                  testID="expense-item-submit-button"
                  title={isEditing ? 'Guardar' : 'Crear'}
                  onPress={handleSubmit}
                  loading={isSubmitting || isLoading}
                  disabled={isSubmitting || isLoading}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </FadeInDown>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: spacing.sm,
    marginBottom: spacing.lg,
  },
  amountInput: {
    flex: 1,
  },
  categorySection: {
    marginTop: spacing.md,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 16,
  },
  categoryPicker: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  categoryOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  categoryOptionText: {
    fontSize: 16,
  },
  noCategoriesText: {
    padding: spacing.md,
    fontSize: 14,
    textAlign: 'center',
  },
  newCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  newCategoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearCategoryButton: {
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  clearCategoryText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
