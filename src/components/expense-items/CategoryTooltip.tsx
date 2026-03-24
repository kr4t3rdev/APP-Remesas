import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FadeIn } from "../animations";
import { spacing, borderRadius } from "../../theme";
import { useColors } from "../../store/themeStore";

const CATEGORY_TOOLTIP_TEXT =
  "Usar categorías te permite organizar mejor tus gastos y obtener reportes más detallados. Ejemplos: Inmuebles, Servicios, Operaciones.";

export const CategoryTooltip: React.FC = () => {
  const themeColors = useColors();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        testID="category-info-button"
        onPress={() => setVisible(!visible)}
        style={styles.infoButton}
      >
        <Ionicons
          name="information-circle"
          size={28}
          color={themeColors.primary[500]}
        />
      </Pressable>

      {visible && (
        <FadeIn duration={200}>
          <View
            style={[
              styles.tooltip,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text
              style={[styles.tooltipText, { color: themeColors.text.primary }]}
            >
              {CATEGORY_TOOLTIP_TEXT}
            </Text>
            <Pressable
              onPress={() => setVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={16}
                color={themeColors.text.secondary}
              />
            </Pressable>
          </View>
        </FadeIn>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: spacing.md,
    alignItems: "flex-end",
    zIndex: 100,
  },
  infoButton: {
    padding: spacing.xs,
  },
  tooltip: {
    maxWidth: 280,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipText: {
    fontSize: 14,
    lineHeight: 20,
    paddingRight: spacing.lg,
  },
  closeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
});
