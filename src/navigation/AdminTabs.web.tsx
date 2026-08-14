import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { AdminTabParamList } from "./types";
import { AdminScreenPerfil } from "../screens/admin/AdminScreenPerfil";
import { AdminHomeScreen } from "../screens/admin/AdminHomeScreen";
import { AdminRoutes } from "./adminRoutes";
import { AdminUsersScreen } from "../screens/admin/AdminUsersScreen";
import { AdminReportsScreen } from "../screens/admin/AdminReportsScreen";
import { ResponsiveTabBar } from "./responsiveShell";
import { TabBarMotionProvider } from "./TabBarMotionProvider";
import { useResponsive, BREAKPOINTS } from "../hooks/useResponsive";
import { WebWorkspaceFrame } from "../web/workspace/WebWorkspaceFrame";

const Tab = createBottomTabNavigator<AdminTabParamList>();

const screenComponents = {
  AdminHome: AdminHomeScreen,
  AdminServices: AdminRoutes,
  AdminUsers: AdminUsersScreen,
  AdminReports: AdminReportsScreen,
  AdminProfile: AdminScreenPerfil,
} as const;

const screenTitles: Record<keyof AdminTabParamList, string> = {
  AdminHome: "Resumen de plataforma",
  AdminServices: "Servicios y planes",
  AdminUsers: "Usuarios",
  AdminReports: "Reportes de plataforma",
  AdminProfile: "Perfil administrador",
};

function workspaceScreen(route: keyof AdminTabParamList) {
  const Screen = screenComponents[route];
  return function WebAdminWorkspaceScreen(props: object) {
    return (
      <WebWorkspaceFrame title={screenTitles[route]} eyebrow="CASHFLOW / CONTROL DE PLATAFORMA">
        <Screen {...props} />
      </WebWorkspaceFrame>
    );
  };
}

const workspaceScreens = {
  AdminHome: workspaceScreen("AdminHome"),
  AdminServices: workspaceScreen("AdminServices"),
  AdminUsers: workspaceScreen("AdminUsers"),
  AdminReports: workspaceScreen("AdminReports"),
  AdminProfile: workspaceScreen("AdminProfile"),
} as const;

export const AdminTabs: React.FC = () => {
  const { width } = useResponsive();
  const isWebDesktop = width >= BREAKPOINTS.tablet;

  return (
    <TabBarMotionProvider>
      <Tab.Navigator
        tabBar={(props) => <ResponsiveTabBar isAdmin {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarPosition: isWebDesktop ? "left" : "bottom",
        }}
      >
        <Tab.Screen name="AdminHome" component={workspaceScreens.AdminHome} options={{ tabBarLabel: "Inicio", tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }} />
        <Tab.Screen name="AdminServices" component={workspaceScreens.AdminServices} options={{ tabBarLabel: "Servicios", tabBarIcon: ({ color }) => <Ionicons name="construct" size={20} color={color} /> }} />
        <Tab.Screen name="AdminUsers" component={workspaceScreens.AdminUsers} options={{ tabBarLabel: "Usuarios", tabBarIcon: ({ color }) => <Ionicons name="people" size={20} color={color} /> }} />
        <Tab.Screen name="AdminReports" component={workspaceScreens.AdminReports} options={{ tabBarLabel: "Reportes", tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={20} color={color} /> }} />
        <Tab.Screen name="AdminProfile" component={workspaceScreens.AdminProfile} options={{ tabBarLabel: "Perfil", tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }} />
      </Tab.Navigator>
    </TabBarMotionProvider>
  );
};
