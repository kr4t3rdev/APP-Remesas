import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useColors } from "../../store/themeStore";
import { useResponsive, BREAKPOINTS } from "../../hooks/useResponsive";
import { spacing, header } from "../../theme";
import { NotificationCenter } from "../notifications/NotificationCenter";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  testID?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "XChange$ocial",
  showSearch = true,
  testID = "header",
}) => {
  const user = useAuthStore((state) => state.user);
  const colors = useColors();
  const { isDesktop, width } = useResponsive();

  // Don't render on mobile (handled by SafeAreaView)
  if (width < BREAKPOINTS.tablet) {
    return null;
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <View
      testID={testID}
      style={[
        styles.header,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Desktop Layout: Logo + Search + User */}
      {isDesktop ? (
        <>
          {/* Left: Logo */}
          <View style={styles.leftSection}>
            <View
              style={[styles.logoIcon, { backgroundColor: colors.primary[50] }]}
            >
              <Ionicons name="cash" size={24} color={colors.primary[500]} />
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {title}
            </Text>
          </View>

          {/* Center: Search */}
          {showSearch && (
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons name="search" size={18} color={colors.text.tertiary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text.primary }]}
                placeholder="Buscar..."
                placeholderTextColor={colors.text.tertiary}
              />
              <TouchableOpacity style={styles.searchShortcut}>
                <Text
                  style={[
                    styles.searchShortcutText,
                    { color: colors.text.tertiary },
                  ]}
                >
                  ⌘K
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right: Actions + User */}
          <View style={styles.rightSection}>
            {/* Notifications */}
            <NotificationCenter />

            {/* Settings */}
            <TouchableOpacity
              style={styles.iconButton}
              accessibilityLabel="Configuración"
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={colors.text.primary}
              />
            </TouchableOpacity>

            {/* User Avatar */}
            <View
              style={[
                styles.userAvatar,
                { backgroundColor: colors.primary[100] },
              ]}
            >
              <Text style={{ color: colors.primary[700], fontWeight: "600" }}>
                {getUserInitials()}
              </Text>
            </View>
          </View>
        </>
      ) : (
        /* Tablet Layout: Simple centered title */
        <View style={styles.tabletHeader}>
          <View
            style={[
              styles.logoIconSmall,
              { backgroundColor: colors.primary[50] },
            ]}
          >
            <Ionicons name="cash" size={20} color={colors.primary[500]} />
          </View>
          <Text style={[styles.tabletTitle, { color: colors.text.primary }]}>
            {title}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: header.height,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  searchContainer: {
    flex: 1,
    maxWidth: header.searchMaxWidth,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    height: 40,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchShortcut: {
    paddingHorizontal: spacing.xs,
  },
  searchShortcutText: {
    fontSize: 11,
    fontWeight: "500",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  tabletHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  logoIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tabletTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Header;
