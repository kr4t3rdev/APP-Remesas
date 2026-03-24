import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Alert } from "../../utils/alert";

import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../animations";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ExpenseCategoryPicker } from "./ExpenseCategoryPicker";
import { ExpenseAmountInput } from "./ExpenseAmountInput";
import { ExpenseDatePicker } from "./ExpenseDatePicker";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseCategory,
} from "../../types";

type ExpenseFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseInput | UpdateExpenseInput) => Promise<void>;
  expense?: Expense | null;
  isLoading?: boolean;
};

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  expense,
  isLoading = false,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("otros");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!expense;

  useEffect(() => {
    if (visible) {
      if (expense) {
        setDescription(expense.description);
        setAmount(expense.amount.toString());
        setCategory(expense.category);
        setDate(expense.date);
        setNotes(expense.notes || "");
      } else {
        setDescription("");
        setAmount("");
        setCategory("otros");
        setDate(new Date().toISOString().split("T")[0]);
        setNotes("");
      }
      setErrors({});
    }
  }, [visible, expense]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = "La descripción es requerida";
    }
    if (!amount || Number(amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0";
    }
    if (!date) {
      newErrors.date = "La fecha es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        description: description.trim(),
        amount: Number(amount),
        category,
        date,
        notes: notes.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el gasto. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FadeInDown>
          <View
            style={[
              styles.container,
              { backgroundColor: themeColors.card },
              themeShadows.lg,
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: themeColors.text.primary }]}>
                {isEditing ? "Editar Gasto" : "Nuevo Gasto"}
              </Text>
              <TouchableOpacity
                testID="close-expense-modal"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={themeColors.text.primary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <Input
                testID="expense-description-input"
                label="Descripción"
                value={description}
                onChangeText={setDescription}
                placeholder="Ej: Internet del mes"
                error={errors.description}
              />

              <ExpenseAmountInput
                value={amount}
                onChange={setAmount}
                error={errors.amount}
              />

              <ExpenseCategoryPicker
                value={category}
                onChange={setCategory}
                error={errors.category}
              />

              <ExpenseDatePicker
                value={date}
                onChange={setDate}
                error={errors.date}
              />

              <Input
                label="Notas (opcional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Agregar notas..."
                multiline
                numberOfLines={3}
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />
            </ScrollView>

            <View style={styles.footer}>
              <Button
                testID="expense-cancel-button"
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1 }}
              />
              <Button
                testID="expense-submit-button"
                title={isEditing ? "Guardar" : "Crear"}
                onPress={handleSubmit}
                loading={isSubmitting || isLoading}
                disabled={isSubmitting || isLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </FadeInDown>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
