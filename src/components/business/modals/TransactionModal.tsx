import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useColors } from "../../../store/themeStore";
import { useCreateTransaction } from "../../../hooks/queries/useBusinessQueries";

export const TransactionModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const colors = useColors();
  const { mutate: createTx, isPending } = useCreateTransaction();

  const [amount, setAmount] = useState("");
  const [sourceCurrency, setSourceCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("EUR");

  const handleSave = () => {
    if (!amount) return;
    createTx(
      {
        date: new Date().toISOString().split("T")[0],
        type: "BUY",
        sourceCurrency,
        targetCurrency,
        amount: parseFloat(amount),
        rate: 1.1, // mock
      },
      {
        onSuccess: () => {
          onClose();
          setAmount("");
        },
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Nueva Transacción
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text.primary },
            ]}
            placeholder="Monto"
            placeholderTextColor={colors.text.secondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, { backgroundColor: colors.border }]}
            >
              <Text style={{ color: colors.text.primary }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isPending}
              style={[styles.button, { backgroundColor: colors.primary[500] }]}
            >
              <Text style={{ color: "#fff" }}>
                {isPending ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  container: { width: "80%", padding: 20, borderRadius: 12, elevation: 5 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  button: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
});
