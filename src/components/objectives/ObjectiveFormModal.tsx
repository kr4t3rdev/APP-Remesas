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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert } from "../../utils/alert";

import { Ionicons } from "@expo/vector-icons";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ObjectiveStatusPicker } from "./ObjectiveStatusPicker";
import { ExpenseAmountInput } from "../expenses/ExpenseAmountInput";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type {
  Objective,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  ObjectiveStatus,
} from "../../types";

type ObjectiveFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateObjectiveInput | UpdateObjectiveInput,
  ) => Promise<void>;
  objective?: Objective | null;
  isLoading?: boolean;
};

export const ObjectiveFormModal: React.FC<ObjectiveFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  objective,
  isLoading = false,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [status, setStatus] = useState<ObjectiveStatus>("ACTIVO");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!objective;

  useEffect(() => {
    if (visible) {
      if (objective) {
        setName(objective.name);
        setDescription(objective.description || "");
        setTargetAmount(objective.targetAmount.toString());
        setStatus(objective.status);
      } else {
        setName("");
        setDescription("");
        setTargetAmount("");
        setStatus("ACTIVO");
      }
      setErrors({});
    }
  }, [visible, objective]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    if (!targetAmount || Number(targetAmount) <= 0) {
      newErrors.targetAmount = "El monto objetivo debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        targetAmount: Number(targetAmount),
        status,
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el objetivo. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View testID="objective-modal-overlay" style={styles.overlay}>
        <View testID="objective-modal-bottom-anchor" style={styles.bottomAnchor}>
          <KeyboardAvoidingView
            testID="objective-modal-keyboard-region"
            style={styles.keyboardRegion}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
          <View
            style={[
              styles.container,
              { backgroundColor: themeColors.card },
              { paddingBottom: insets.bottom },
              themeShadows.lg,
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: themeColors.text.primary }]}>
                {isEditing ? "Editar Objetivo" : "Nuevo Objetivo"}
              </Text>
              <TouchableOpacity
                testID="close-objective-modal"
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
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              <Input
                testID="objective-name-input"
                label="Nombre del objetivo"
                value={name}
                onChangeText={setName}
                placeholder="Ej: Ahorrar para laptop"
                error={errors.name}
              />

              <Input
                label="Descripción (opcional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Agregar descripción..."
                multiline
                numberOfLines={2}
                style={{ minHeight: 60, textAlignVertical: "top" }}
              />

              <ExpenseAmountInput
                value={targetAmount}
                onChange={setTargetAmount}
                label="Monto objetivo"
                error={errors.targetAmount}
              />

              {isEditing && (
                <ObjectiveStatusPicker
                  value={status}
                  onChange={setStatus}
                  error={errors.status}
                />
              )}
            </ScrollView>

            <View style={styles.footer}>
              <Button
                testID="objective-cancel-button"
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1 }}
              />
              <Button
                testID="objective-submit-button"
                title={isEditing ? "Guardar" : "Crear"}
                onPress={handleSubmit}
                loading={isSubmitting || isLoading}
                disabled={isSubmitting || isLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomAnchor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "90%",
  },
  keyboardRegion: {
    flexShrink: 1,
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "100%",
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
