import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  CommonActions,
  NavigationContainer,
} from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useColors } from "../../store/themeStore";
import { useResponsive, BREAKPOINTS } from "../../hooks/useResponsive";
import { useResponsiveStore } from "../../store/responsiveStore";
import { spacing, borderRadius, sidebar } from "../../theme";
import { AppLogo } from "../branding/AppLogo";

export interface SidebarItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  adminOnly?: boolean;
}

const DEFAULT_ITEMS: SidebarItem[] = [
  { icon: "home", label: "Inicio", route: "Home" },
  { icon: "swap-horizontal", label: "Transacciones", route: "Transactions" },
  { icon: "wallet", label: "Caja", route: "Cash" },
  { icon: "bar-chart", label: "Reportes", route: "Reports" },
  { icon: "person", label: "Perfil", route: "Profile" },
];

const ADMIN_ITEMS: SidebarItem[] = [
  { icon: "home", label: "Inicio", route: "AdminHome", adminOnly: true },
  {
    icon: "construct",
    label: "Servicios",
    route: "AdminServices",
    adminOnly: true,
  },
  { icon: "people", label: "Usuarios", route: "AdminUsers", adminOnly: true },
  {
    icon: "analytics",
    label: "Reportes",
    route: "AdminReports",
    adminOnly: true,
  },
  { icon: "person", label: "Perfil", route: "AdminProfile", adminOnly: true },
];

interface SidebarProps {
  isAdmin?: boolean;
  testID?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isAdmin = false,
  testID = "sidebar",
}) => {
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const colors = useColors();
  const { sidebarMode, width } = useResponsive();
  const { isSidebarCollapsed, toggleSidebar } = useResponsiveStore();

  // Determine if sidebar should be collapsed
  const isCollapsed = useMemo(() => {
    // Use persisted state if available, otherwise use breakpoint-based mode
    if (width < BREAKPOINTS.tablet) return true; // Hidden on mobile
    return isSidebarCollapsed === "collapsed" || sidebarMode === "collapsed";
  }, [isSidebarCollapsed, sidebarMode, width]);

  // Get items based on admin status
  const items = useMemo(() => {
    return isAdmin ? ADMIN_ITEMS : DEFAULT_ITEMS;
  }, [isAdmin]);

  // Get current route name from navigation state
  const currentRoute = useMemo(() => {
    const state = navigation.getState();
    if (state?.routes?.length) {
      const currentTab = state.routes[state.index || 0];
      return currentTab?.name || (isAdmin ? "AdminHome" : "Home");
    }
    return isAdmin ? "AdminHome" : "Home";
  }, [navigation, isAdmin]);

  const navigate = useCallback(
    (routeName: string) => {
      try {
        navigation.dispatch(
          CommonActions.navigate({
            name: routeName,
            merge: true,
          }),
        );
      } catch (error) {
        // Fallback for cross-navigation navigations (user to admin)
        try {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: routeName }],
            }),
          );
        } catch (e) {
          console.warn("Navigation error:", e);
        }
      }
    },
    [navigation],
  );

  const isActive = useCallback(
    (routeName: string): boolean => {
      return currentRoute === routeName;
    },
    [currentRoute],
  );

  // Don't render on mobile
  if (width < BREAKPOINTS.tablet) {
    return null;
  }

  return (
    <View
      testID={testID}
      style={[
        styles.sidebar,
        { backgroundColor: colors.card },
        isCollapsed ? styles.collapsed : styles.expanded,
      ]}
    >
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <AppLogo size={isCollapsed ? 40 : 40} style={styles.logoIcon} />
        {!isCollapsed && (
          <Text
            style={[styles.logoText, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            CashFlows
          </Text>
        )}
      </View>

      {/* Navigation Items */}
      <View style={styles.navContainer}>
        {items.map((item) => {
          const isItemActive = isActive(item.route);

          return (
            <TouchableOpacity
              key={`${item.route}-${item.adminOnly ? "admin" : "user"}`}
              style={[
                styles.navItem,
                { borderRadius: borderRadius.md },
                isItemActive ? { backgroundColor: colors.primary[50] } : {},
              ]}
              onPress={() => navigate(item.route)}
              onFocus={() => {}} // Track focus for keyboard nav
              activeOpacity={0.7}
              accessibilityLabel={item.label}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: isItemActive }}
              accessible={true}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={
                  isActive(item.route)
                    ? colors.primary[500]
                    : colors.text.secondary
                }
              />
              {!isCollapsed && (
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: isActive(item.route)
                        ? colors.primary[700]
                        : colors.text.primary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Collapse Toggle */}
      {width >= BREAKPOINTS.desktop && (
        <TouchableOpacity
          style={[styles.collapseButton, { borderTopColor: colors.border }]}
          onPress={toggleSidebar}
          activeOpacity={0.7}
          accessibilityLabel={
            isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"
          }
          accessibilityRole="button"
          accessible={true}
        >
          <Ionicons
            name={isCollapsed ? "chevron-forward" : "chevron-back"}
            size={20}
            color={colors.text.tertiary}
          />
          {!isCollapsed && (
            <Text
              style={[styles.collapseText, { color: colors.text.tertiary }]}
            >
              Colapsar
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    height: "100%",
    paddingVertical: spacing.md,
    ...Platform.select({
      web: {
        boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  expanded: {
    width: sidebar.expandedWidth,
  },
  collapsed: {
    width: sidebar.collapsedWidth,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    minHeight: sidebar.itemHeight,
  },
  navItemActive: {
    fontWeight: "600",
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    marginTop: spacing.md,
  },
  collapseText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default Sidebar;
