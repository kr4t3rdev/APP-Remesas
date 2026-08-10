import React, { useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useColors,
  useMode,
  useThemeId,
  useThemeStore,
} from "../../store/themeStore";
import { THEME_LIST, borderRadius, spacing } from "../../theme";
import type { ThemeMode } from "../../store/themeStore";

type ThemePickerModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  visible,
  onClose,
}) => {
  const colors = useColors();
  const mode = useMode();
  const themeId = useThemeId();
  const setThemeId = useThemeStore((state) => state.setThemeId);
  const setMode = useThemeStore((state) => state.setMode);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80) onClose();
      },
    }),
  ).current;

  const modes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: "light", label: "Claro", icon: "sunny" },
    { value: "dark", label: "Oscuro", icon: "moon" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View
              style={[styles.handle, { backgroundColor: colors.text.secondary }]}
            />
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Tema visual
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Elegí la identidad de color de la app
            </Text>

            <View
              style={[styles.segmented, { backgroundColor: colors.surface }]}
            >
              {modes.map((m) => {
                const active = mode === m.value;
                return (
                  <TouchableOpacity
                    key={m.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setMode(m.value)}
                    style={[
                      styles.segment,
                      active && { backgroundColor: colors.primary[500] },
                    ]}
                  >
                    <Ionicons
                      name={m.icon as any}
                      size={16}
                      color={active ? colors.text.inverse : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.segmentLabel,
                        {
                          color: active
                            ? colors.text.inverse
                            : colors.text.secondary,
                        },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.grid}>
              {THEME_LIST.map((theme) => {
                const selected = theme.id === themeId;
                const palette = mode === "dark" ? theme.darkColors : theme.colors;
                return (
                  <TouchableOpacity
                    key={theme.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setThemeId(theme.id)}
                    activeOpacity={0.7}
                    style={[
                      styles.themeCard,
                      selected && {
                        borderColor: colors.primary[500],
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <View
                      style={[styles.swatch, { backgroundColor: palette.background }]}
                    >
                      <View
                        style={[
                          styles.swatchBar,
                          { backgroundColor: palette.primary[500] },
                        ]}
                      />
                      <View style={styles.swatchDots}>
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: palette.secondary[500] },
                          ]}
                        />
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: palette.accent[400] },
                          ]}
                        />
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: palette.financial.venta },
                          ]}
                        />
                      </View>
                      {selected && (
                        <View
                          style={[
                            styles.checkBadge,
                            { backgroundColor: colors.primary[500] },
                          ]}
                        >
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.themeName, { color: colors.text.primary }]}>
                      {theme.name}
                    </Text>
                    <Text style={[styles.themeTag, { color: colors.text.secondary }]}>
                      {theme.tagline}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "85%",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
  themeCard: {
    width: "48%",
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: "transparent",
    padding: spacing.sm,
  },
  swatch: {
    height: 76,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    position: "relative",
  },
  swatchBar: {
    height: 28,
  },
  swatchDots: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  themeName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  themeTag: {
    fontSize: 12,
    marginTop: 2,
  },
});
