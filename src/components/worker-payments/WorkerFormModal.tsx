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
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type { Worker, CreateWorkerInput } from "../../types";

type WorkerFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkerInput) => Promise<void>;
  worker?: Worker | null;
  recentWorkers?: Worker[];
  isLoading?: boolean;
};

export const WorkerFormModal: React.FC<WorkerFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  worker,
  recentWorkers = [],
  isLoading = false,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!worker;

  useEffect(() => {
    if (visible) {
      if (worker) {
        setName(worker.name);
        setPhone(worker.phone || "");
      } else {
        setName("");
        setPhone("");
      }
      setErrors({});
    }
  }, [visible, worker]);

  const generatedInitials = name.trim()
    ? `${name.trim().substring(0, 2).toUpperCase()}${name.trim().split(" ")[1]?.substring(0, 1).toUpperCase() || ""}`
    : "TR";

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio para el registro";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      onClose();
    } catch {
      Alert.alert(
        "Error",
        "No se pudo guardar el trabajador. Intenta de nuevo.",
      );
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
                {isEditing ? "Editar Trabajador" : "Nuevo Trabajador"}
              </Text>
              <TouchableOpacity
                testID="worker-cancel-button"
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
            >
              <View style={styles.avatarBlock}>
                <View
                  style={[
                    styles.previewAvatar,
                    { backgroundColor: themeColors.primary[500] },
                  ]}
                >
                  <Text style={styles.previewInitials}>
                    {generatedInitials}
                  </Text>
                </View>
                <View
                  style={[
                    styles.cameraBadge,
                    { backgroundColor: themeColors.card },
                  ]}
                >
                  <Ionicons
                    name="camera-outline"
                    size={12}
                    color={themeColors.primary[500]}
                  />
                </View>
                <Text
                  style={[
                    styles.avatarLabel,
                    { color: themeColors.text.secondary },
                  ]}
                >
                  AVATAR GENERADO
                </Text>
              </View>

              <Input
                testID="worker-name-input"
                label="NOMBRE COMPLETO *"
                value={name}
                onChangeText={setName}
                placeholder="Ej. Juan Rivera"
                error={errors.name}
                autoCapitalize="words"
              />

              <Input
                testID="worker-phone-input"
                label="TELÉFONO (OPCIONAL)"
                value={phone}
                onChangeText={setPhone}
                placeholder="+52 000 000 0000"
                keyboardType="phone-pad"
              />
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1 }}
              />
              <Button
                testID="worker-submit-button"
                title="Guardar Trabajador"
                onPress={handleSubmit}
                loading={isSubmitting || isLoading}
                disabled={isSubmitting || isLoading}
                style={{ flex: 1, backgroundColor: "#3B82F6" }}
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
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
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
  avatarBlock: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  previewInitials: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  cameraBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -14,
    marginLeft: 52,
  },
  avatarLabel: {
    marginTop: spacing.xs,
    fontSize: 11,
    letterSpacing: 0.6,
    fontWeight: "500",
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
