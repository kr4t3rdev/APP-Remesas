import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useColors, useIsDark, useThemeStore } from "../../store/themeStore";
import { webMetrics, webType } from "../design/webTokens";

interface WebWorkspaceFrameProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}

export function WebWorkspaceFrame({
  title,
  eyebrow = "CASHFLOW / MESA OPERATIVA",
  children,
}: WebWorkspaceFrameProps) {
  const colors = useColors();
  const isDark = useIsDark();
  const { toggleTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const styles = createStyles(colors);
  const initials = getInitials(user?.name, user?.email);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        testID="web-workspace-topbar"
        accessibilityRole="header"
        style={[styles.topbar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <View style={styles.heading}>
          <Text style={[styles.eyebrow, { color: colors.primary[600] }]}>{eyebrow}</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        </View>
        <View style={styles.topbarActions}>
          <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.searchIcon, { color: colors.text.tertiary }]}>⌕</Text>
            <TextInput
              accessibilityLabel="Buscar en Cashflow"
              placeholder="Buscar en Cashflow"
              placeholderTextColor={colors.text.tertiary}
              style={[styles.searchInput, { color: colors.text.primary }]}
            />
            <Text style={[styles.shortcut, { color: colors.text.tertiary }]}>⌘K</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cambiar tema"
            onPress={toggleTheme}
            style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { opacity: 0.65 }]}
          >
            <Text style={[styles.iconGlyph, { color: colors.text.secondary }]}>{isDark ? "☼" : "☾"}</Text>
          </Pressable>
          <View style={[styles.avatar, { backgroundColor: colors.primary[100] }]}>
            <Text style={[styles.avatarText, { color: colors.primary[700] }]}>{initials}</Text>
          </View>
          <View style={styles.userCopy}>
            <Text numberOfLines={1} style={[styles.userName, { color: colors.text.primary }]}>
              {user?.name || "Operador"}
            </Text>
            <Text numberOfLines={1} style={[styles.userRole, { color: colors.text.tertiary }]}>
              {user?.role === "ADMIN" ? "Administrador" : "Operador"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email?.slice(0, 1).toUpperCase() || "U";
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    root: { flex: 1, minHeight: 0 },
    topbar: {
      minHeight: webMetrics.topbarHeight,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      paddingHorizontal: 24,
      gap: 20,
    },
    heading: { gap: 2, minWidth: 160 },
    eyebrow: { fontFamily: webType.family, fontSize: 10, fontWeight: "700", letterSpacing: 1.1 },
    title: { fontFamily: webType.family, fontSize: 18, fontWeight: "700" },
    topbarActions: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 },
    search: {
      height: 38,
      maxWidth: 420,
      minWidth: 220,
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 11,
      gap: 8,
    },
    searchIcon: { fontSize: 20, lineHeight: 20 },
    searchInput: { flex: 1, minWidth: 0, fontFamily: webType.family, fontSize: 13, paddingVertical: 0, outlineStyle: "none" } as any,
    shortcut: { fontFamily: webType.family, fontSize: 11 },
    iconButton: {
      width: 38,
      height: 38,
      borderWidth: 1,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    iconGlyph: { fontFamily: webType.family, fontSize: 18 },
    avatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    avatarText: { fontFamily: webType.family, fontSize: 12, fontWeight: "700" },
    userCopy: { minWidth: 92, maxWidth: 140, gap: 2 },
    userName: { fontFamily: webType.family, fontSize: 12, fontWeight: "700" },
    userRole: { fontFamily: webType.family, fontSize: 11 },
    content: { flex: 1, minHeight: 0 },
  });
