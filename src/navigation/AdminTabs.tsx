import type React from "react";
import { Platform } from "react-native";
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

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminTabs: React.FC = () => {
	const { width } = useResponsive();
	const isWebDesktop =
		Platform.OS === "web" && width >= BREAKPOINTS.tablet;

	return (
		<TabBarMotionProvider>
			<Tab.Navigator
				tabBar={(props) => <ResponsiveTabBar isAdmin {...props} />}
				screenOptions={{
					headerShown: false,
					tabBarPosition: isWebDesktop ? "left" : "bottom",
				}}
			>
			<Tab.Screen
				name="AdminHome"
				component={AdminHomeScreen}
				options={{
					tabBarLabel: "Inicio",
					tabBarIcon: ({ color }) => (
						<Ionicons name="home" size={24} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="AdminServices"
				component={AdminRoutes}
				options={{
					tabBarLabel: "Servicios",
					tabBarIcon: ({ color }) => (
						<Ionicons name="construct" size={24} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="AdminUsers"
				component={AdminUsersScreen}
				options={{
					tabBarLabel: "Usuarios",
					tabBarIcon: ({ color }) => (
						<Ionicons name="people" size={24} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="AdminReports"
				component={AdminReportsScreen}
				options={{
					tabBarLabel: "Reportes",
					tabBarIcon: ({ color }) => (
						<Ionicons name="bar-chart" size={24} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="AdminProfile"
				component={AdminScreenPerfil}
				options={{
					tabBarLabel: "Perfil",
					tabBarIcon: ({ color }) => (
						<Ionicons name="person" size={24} color={color} />
					),
				}}
			/>
		</Tab.Navigator>
		</TabBarMotionProvider>
	);
};
