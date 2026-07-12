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
import type { Worker } from "../../types";

type TransactionFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    amount: number,
    profit: number,
    description?: string,
  ) => Promise<void>;
  worker: Worker | null;
  isLoading?: boolean;
};

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  worker,
  isLoading = false,
}) => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const [amount, setAmount] = useState("");
  const [profit, setProfit] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmount("");
      setProfit("");
      setDescription("");
      setErrors({});
    }
  }, [visible]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const numAmount = Number(amount);
    const numProfit = Number(profit);

    if (!amount || numAmount <= 0) {
      newErrors.amount = "La cantidad debe ser mayor a 0";
    }
    if (!profit || numProfit < 0) {
      newErrors.profit = "La ganancia debe ser 0 o mayor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(
        Number(amount),
        Number(profit),
        description.trim() || undefined,
      );
      onClose();
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo registrar la transacción. Intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const newBalance = worker ? Number(worker.balance) - Number(amount || 0) : 0;

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
                Registrar Transacción
              </Text>
              <TouchableOpacity
                testID="close-transaction-modal"
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
                testID="transaction-amount-input"
                label="Cantidad de la transacción"
                value={amount}
                onChangeText={setAmount}
                placeholder="Ej: 100"
                keyboardType="numeric"
                error={errors.amount}
              />

              <Input
                testID="transaction-profit-input"
                label="Ganancia"
                value={profit}
                onChangeText={setProfit}
                placeholder="Ej: 25"
                keyboardType="numeric"
                error={errors.profit}
              />

              <Input
                testID="transaction-description-input"
                label="Descripción (opcional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Ej: Venta de producto"
              />

              <View
                style={[
                  styles.previewSection,
                  { backgroundColor: themeColors.background },
                ]}
              >
                <Text
                  style={[
                    styles.previewLabel,
                    { color: themeColors.text.secondary },
                  ]}
                >
                  Vista previa
                </Text>
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
                      {
                        color:
                          newBalance < 0
                            ? themeColors.danger
                            : themeColors.success,
                      },
                    ]}
                  >
                    ${newBalance.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text
                    style={[
                      styles.previewText,
                      { color: themeColors.text.secondary },
                    ]}
                  >
                    Ganancia acumulada:
                  </Text>
                  <Text
                    style={[
                      styles.previewValue,
                      { color: themeColors.primary[500] },
                    ]}
                  >
                    $
                    {(
                      Number(worker?.accumulatedProfit || 0) + Number(profit || 0)
                    ).toLocaleString()}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                testID="transaction-cancel-button"
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1 }}
              />
              <Button
                testID="transaction-submit-button"
                title="Registrar"
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
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  previewText: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 16,
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
