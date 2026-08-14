import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  CommonActions,
  useNavigation,
  type NavigationHelpers,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useColors } from "../../store/themeStore";
import { useResponsive, BREAKPOINTS } from "../../hooks/useResponsive";
import { useResponsiveStore } from "../../store/responsiveStore";
import { AppLogo } from "../branding/AppLogo";
import { webMetrics, webType } from "../../web/design/webTokens";

export interface SidebarItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  adminOnly?: boolean;
}

const USER_ITEMS: readonly SidebarItem[] = [
  { icon: "home", label: "Inicio", route: "Home" },
  { icon: "swap-horizontal", label: "Transacciones", route: "Transactions" },
  { icon: "wallet", label: "Caja", route: "Cash" },
  { icon: "receipt", label: "Gastos", route: "Expenses" },
  { icon: "bar-chart", label: "Reportes", route: "Reports" },
  { icon: "flag", label: "Objetivos", route: "Objectives" },
  { icon: "business", label: "Cuentas", route: "BankAccounts" },
  { icon: "globe", label: "Monedas", route: "Currencies" },
  { icon: "swap-vertical", label: "Tasas", route: "ExchangeRates" },
  { icon: "people", label: "Trabajadores", route: "BusinessWorkers" },
  { icon: "person", label: "Perfil", route: "Profile" },
];

const ADMIN_ITEMS: readonly SidebarItem[] = [
  { icon: "home", label: "Inicio", route: "AdminHome", adminOnly: true },
  { icon: "construct", label: "Servicios", route: "AdminServices", adminOnly: true },
  { icon: "people", label: "Usuarios", route: "AdminUsers", adminOnly: true },
  { icon: "analytics", label: "Reportes", route: "AdminReports", adminOnly: true },
  { icon: "key", label: "Licencias", route: "AdminLicensesList", adminOnly: true },
  { icon: "shield-checkmark", label: "Auditoría", route: "AdminAuditLog", adminOnly: true },
  { icon: "download", label: "Exportar", route: "AdminExportReports", adminOnly: true },
  { icon: "person", label: "Perfil", route: "AdminProfile", adminOnly: true },
];

const ROOT_WORKSPACE_TAB_ROUTES = new Set([
  "Home",
  "Transactions",
  "Cash",
  "Expenses",
  "Reports",
  "Profile",
  "AdminHome",
  "AdminServices",
  "AdminUsers",
  "AdminReports",
  "AdminProfile",
]);

interface SidebarProps {
  isAdmin?: boolean;
  testID?: string;
  hideHeaderLogo?: boolean;
  rootWorkspace?: boolean;
  navigation?: NavigationHelpers<ParamListBase> | NavigationProp<ParamListBase>;
  state?: BottomTabBarProps["state"];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isAdmin = false,
  testID = "sidebar",
  hideHeaderLogo = false,
  rootWorkspace = false,
  navigation: navigationProp,
  state: stateProp,
}) => {
  const fallbackNavigation = useNavigation<NavigationProp<ParamListBase>>();
  const navigation = navigationProp ?? fallbackNavigation;
  const colors = useColors();
  const { sidebarMode, width } = useResponsive();
  const { isSidebarCollapsed, toggleSidebar } = useResponsiveStore();
  const state = stateProp ?? navigation.getState();
  const isCollapsed = width < BREAKPOINTS.desktop || isSidebarCollapsed === "collapsed" || sidebarMode === "collapsed";
  const items = isAdmin ? ADMIN_ITEMS : USER_ITEMS;
  const currentRoute = useMemo(() => {
    const route = state?.routes?.[state.index ?? 0];
    return route?.name ?? (isAdmin ? "AdminHome" : "Home");
  }, [isAdmin, state]);

  const navigate = useCallback((routeName: string) => {
    const tabNavigation = navigation as NavigationProp<ParamListBase> & { jumpTo?: (name: string) => void };
    const isTabRoute = state?.routes?.some((route) => route.name === routeName) || (!isAdmin && routeName === "Reports");
    if (rootWorkspace && ROOT_WORKSPACE_TAB_ROUTES.has(routeName)) {
      navigation.dispatch(CommonActions.navigate({ name: "Main", params: { screen: routeName } }));
      return;
    }
    if (typeof tabNavigation.jumpTo === "function" && isTabRoute) {
      tabNavigation.jumpTo(routeName);
      return;
    }
    navigation.dispatch(CommonActions.navigate({ name: routeName }));
  }, [navigation]);

  const focused = (navigation as NavigationProp<ParamListBase> & { isFocused?: () => boolean }).isFocused?.();
  const parent = navigation.getParent?.();
  const parentFocused = parent?.isFocused?.();
  const parentState = parent?.getState?.();
  const parentRouteName = parentState?.routes?.[parentState.index ?? 0]?.name;
  if (focused === false || parentFocused === false || (parentRouteName && parentRouteName !== "Main" && !rootWorkspace) || width < BREAKPOINTS.tablet) return null;

  return (
    <View
      testID={testID}
      accessibilityRole="menu"
      style={[
        styles.sidebar,
        { backgroundColor: colors.card, borderRightColor: colors.border },
        { width: isCollapsed ? webMetrics.compactSidebarWidth : webMetrics.sidebarWidth },
      ]}
    >
      {!hideHeaderLogo ? (
        <View style={styles.brand}>
          <AppLogo size={36} />
          {!isCollapsed ? (
            <View style={styles.brandCopy}>
              <Text style={[styles.brandName, { color: colors.text.primary }]}>Cashflow</Text>
              <Text style={[styles.brandMeta, { color: colors.text.tertiary }]}>
                {isAdmin ? "Control de plataforma" : "Mesa operativa"}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.nav}>
        {items.map((item) => {
          const active = currentRoute === item.route;
          return (
            <Pressable
              key={item.route}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => navigate(item.route)}
              style={({ pressed }) => [
                styles.navItem,
                { backgroundColor: active ? colors.primary[50] : "transparent" },
                pressed && { opacity: 0.72 },
              ]}
            >
              <Ionicons name={item.icon} size={20} color={active ? colors.primary[600] : colors.text.secondary} />
              {!isCollapsed ? (
                <Text accessible={false} style={[styles.navLabel, { color: active ? colors.primary[700] : colors.text.primary }]}>
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {width >= BREAKPOINTS.desktop ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          onPress={toggleSidebar}
          style={({ pressed }) => [styles.collapse, { borderTopColor: colors.border }, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name={isCollapsed ? "chevron-forward" : "chevron-back"} size={18} color={colors.text.tertiary} />
          {!isCollapsed ? <Text style={[styles.collapseLabel, { color: colors.text.tertiary }]}>Colapsar</Text> : null}
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    height: "100%",
    borderRightWidth: 1,
    paddingVertical: 16,
  },
  brand: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  brandCopy: { flex: 1, gap: 2 },
  brandName: { fontFamily: webType.family, fontSize: 16, fontWeight: "700" },
  brandMeta: { fontFamily: webType.family, fontSize: 11 },
  nav: { flex: 1, gap: 4, paddingHorizontal: 8, paddingTop: 16 },
  navItem: {
    minHeight: 44,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    gap: 12,
  },
  navLabel: { fontFamily: webType.family, fontSize: 14, fontWeight: "600" },
  collapse: {
    minHeight: 44,
    borderTopWidth: 1,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  collapseLabel: { fontFamily: webType.family, fontSize: 12, fontWeight: "600" },
});

export default Sidebar;
