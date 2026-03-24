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
import type { Worker, CreateWorkerInput, UpdateWorkerInput } from "../../types";

type WorkerFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkerInput | UpdateWorkerInput) => Promise<void>;
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio para el registro";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatedInitials = name.trim()
    ? `${name.trim().substring(0, 2).toUpperCase()}${name.trim().split(" ")[1]?.substring(0, 1).toUpperCase() || ""}`
    : "TR";

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
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FadeInDown>
          <View
            style={[styles.screen, { backgroundColor: themeColors.background }]}
          >
            <View
              style={[styles.topBar, { borderBottomColor: themeColors.border }]}
            >
              <TouchableOpacity
                onPress={onClose}
                style={styles.topAction}
                testID="close-worker-modal"
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={themeColors.primary[500]}
                />
              </TouchableOpacity>
              <Text
                style={[styles.topTitle, { color: themeColors.text.primary }]}
              >
                Pagos a Trabajadores
              </Text>
              <View style={styles.profileBubble}>
                <Ionicons name="person" size={14} color="#FFFFFF" />
              </View>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.formCard,
                  { backgroundColor: themeColors.card },
                  themeShadows.md,
                ]}
              >
                <Text
                  style={[
                    styles.sectionTag,
                    { color: themeColors.primary[500] },
                  ]}
                >
                  DIRECTORIO
                </Text>
                <Text
                  style={[styles.bigTitle, { color: themeColors.text.primary }]}
                >
                  {isEditing ? "Editar Trabajador" : "Nuevo Trabajador"}
                </Text>
                <Text
                  style={[
                    styles.description,
                    { color: themeColors.text.secondary },
                  ]}
                >
                  Ingrese la información básica para dar de alta al nuevo
                  integrante del equipo.
                </Text>

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
                      themeShadows.sm,
                    ]}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={14}
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
                  error={undefined}
                  autoCapitalize="words"
                  containerStyle={styles.fieldContainer}
                />
                {errors.name && (
                  <Text
                    style={[styles.errorText, { color: themeColors.danger }]}
                  >
                    {errors.name}
                  </Text>
                )}

                <Input
                  testID="worker-phone-input"
                  label="TELÉFONO (OPCIONAL)"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+52 000 000 0000"
                  keyboardType="phone-pad"
                  containerStyle={styles.fieldContainer}
                  style={styles.phoneInput}
                />

                <Button
                  testID="worker-submit-button"
                  title="Guardar Trabajador"
                  onPress={handleSubmit}
                  loading={isSubmitting || isLoading}
                  disabled={isSubmitting || isLoading}
                  size="lg"
                  style={styles.submitButton}
                />
                <TouchableOpacity
                  testID="worker-cancel-button"
                  onPress={onClose}
                  style={styles.cancelButton}
                >
                  <Text
                    style={[
                      styles.cancelText,
                      { color: themeColors.primary[500] },
                    ]}
                  >
                    Cancelar registro
                  </Text>
                </TouchableOpacity>
              </View>

              {!isEditing && recentWorkers.length > 0 && (
                <View style={styles.recentSection}>
                  <Text
                    style={[
                      styles.recentTitle,
                      { color: themeColors.text.primary },
                    ]}
                  >
                    RECIENTEMENTE AÑADIDOS
                  </Text>
                  {recentWorkers.slice(0, 3).map((recentWorker) => (
                    <View
                      key={recentWorker.id}
                      style={[
                        styles.recentItem,
                        { backgroundColor: themeColors.card },
                        themeShadows.sm,
                      ]}
                    >
                      <View
                        style={[
                          styles.recentAvatar,
                          { backgroundColor: `${themeColors.success}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.recentAvatarText,
                            { color: themeColors.success },
                          ]}
                        >
                          {recentWorker.initials ?? "TR"}
                        </Text>
                      </View>
                      <View style={styles.recentInfo}>
                        <Text
                          style={[
                            styles.recentName,
                            { color: themeColors.text.primary },
                          ]}
                        >
                          {recentWorker.name}
                        </Text>
                        <Text
                          style={[
                            styles.recentMeta,
                            { color: themeColors.text.secondary },
                          ]}
                        >
                          Agregado hoy
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={themeColors.text.tertiary}
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </FadeInDown>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  topAction: {
    width: 28,
    alignItems: "flex-start",
  },
  topTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6C89D",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  formCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  sectionTag: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  bigTitle: {
    fontSize: 56,
    lineHeight: 58,
    fontWeight: "800",
  },
  description: {
    fontSize: 30,
    lineHeight: 38,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  avatarBlock: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  previewAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  previewInitials: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
  },
  cameraBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16,
    marginLeft: 72,
  },
  avatarLabel: {
    marginTop: spacing.sm,
    fontSize: 13,
    letterSpacing: 0.6,
    fontWeight: "500",
  },
  fieldContainer: {
    marginTop: spacing.md,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: 18,
    fontStyle: "italic",
  },
  phoneInput: {
    paddingRight: 42,
  },
  submitButton: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.md,
  },
  cancelButton: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 24,
    fontWeight: "600",
  },
  recentSection: {
    marginTop: spacing.xs,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  recentItem: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  recentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  recentAvatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 15,
    fontWeight: "700",
  },
  recentMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
