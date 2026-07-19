import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { spacing } from "../../theme";
import { useColors } from "../../store/themeStore";

export const ProfileFeatureBackButton: React.FC = () => {
  const navigation = useNavigation();
  const colors = useColors();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Regresar al perfil"
      onPress={() => navigation.goBack()}
      style={styles.button}
    >
      <Ionicons name="arrow-back" size={22} color={colors.primary[600]} />
      <Text style={[styles.label, { color: colors.primary[600] }]}>Regresar</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});
