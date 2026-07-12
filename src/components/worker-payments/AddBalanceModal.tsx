import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
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
import type { Worker } from "../../types";

type AddBalanceModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  worker: Worker | null;
  isLoading?: boolean;
};

export const AddBalanceModal: React.FC<AddBalanceModalProps> = ({
  visible,
  onClose,
  onSubmit,
  worker,
  isLoading = false,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmount("");
      setErrors({});
    }
  }, [visible]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const numAmount = Number(amount);

    if (!amount || numAmount <= 0) {
      newErrors.amount = "El monto debe ser mayor a cero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(Number(amount));
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el saldo. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const newBalance = worker ? Number(worker.balance) + Number(amount || 0) : 0;

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
                Agregar Saldo
              </Text>
              <TouchableOpacity
                testID="close-balance-modal"
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

            <View style={styles.content}>
              {worker && (
                <View
                  style={[
                    styles.workerInfo,
                    { backgroundColor: themeColors.background },
                  ]}
                >
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: themeColors.primary[500] },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        { color: themeColors.text.inverse },
                      ]}
                    >
                      {worker.initials}
                    </Text>
                  </View>
                  <View style={styles.workerDetails}>
                    <Text
                      style={[
                        styles.workerName,
                        { color: themeColors.text.primary },
                      ]}
                    >
                      {worker.name}
                    </Text>
                    <Text
                      style={[
                        styles.workerBalance,
                        { color: themeColors.text.secondary },
                      ]}
                    >
                      Saldo actual: ${Number(worker.balance).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              <Input
                testID="balance-amount-input"
                label="Monto a entregar"
                value={amount}
                onChangeText={setAmount}
                placeholder="Ej: 500"
                keyboardType="numeric"
                error={errors.amount}
              />

              <View
                style={[
                  styles.previewSection,
                  { backgroundColor: themeColors.background },
                ]}
              >
                <View style={styles.previewRow}>
                  <Text
                    style={[
                      styles.previewText,
                      { color: themeColors.text.secondary },
                    ]}
                  >
                    Nuevo saldo:
                  </Text>
                  <Text
                    style={[
                      styles.previewValue,
                      { color: themeColors.success },
                    ]}
                  >
                    ${newBalance.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                testID="balance-cancel-button"
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1 }}
              />
              <Button
                testID="balance-submit-button"
                title="Agregar"
                onPress={handleSubmit}
                loading={isSubmitting || isLoading}
                disabled={isSubmitting || isLoading}
                style={{ flex: 1, backgroundColor: "#10B981" }}
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
  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  workerBalance: {
    fontSize: 14,
    marginTop: 2,
  },
  previewSection: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewText: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: "700",
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
