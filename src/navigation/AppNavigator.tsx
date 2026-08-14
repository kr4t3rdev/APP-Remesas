import type React from "react";
import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Platform } from "react-native";
import { WelcomeScreen } from "../screens/auth/WelcomeScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { ChangePasswordScreen } from "../screens/auth/ChangePasswordScreen";
import { VerificationPendingScreen } from "../screens/auth/VerificationPendingScreen";
import { CashHistoryScreen } from "../screens/cash/CashHistoryScreen";
import { ExchangeRatesScreen } from "../screens/exchange-rates/ExchangeRatesScreen";
import { BankAccountsScreen } from "../screens/bank-accounts/BankAccountsScreen";
import { CurrenciesScreen } from "../screens/currencies/CurrenciesScreen";
import { ReportsScreen } from "../screens/reports/ReportsScreen";
import { ObjectivesScreen } from "../screens/objectives/ObjectivesScreen";
import { MainTabs } from "./MainTabs";
import { AdminTabs } from "./AdminTabs";
import { usePushNotificationHandler } from "../hooks/usePushNotificationHandler";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme";
import type { RootStackParamList } from "./types";
import { webLinking } from "./webLinking";
import { WebWorkspaceFrame } from "../web/workspace/WebWorkspaceFrame";
import { Sidebar } from "../components/layout/Sidebar";
import { AdminUserDetailScreen } from "../screens/admin/AdminUserDetailScreen";
import { AdminLicensesListScreen } from "../screens/admin/licenses/AdminLicensesListScreen";
import { AdminLicenseDetailScreen } from "../screens/admin/licenses/AdminLicenseDetailScreen";
import { AdminAuditLogScreen } from "../screens/admin/AdminAuditLogScreen";
import { AdminExportReportsScreen } from "../screens/admin/AdminExportReportsScreen";
import {
	BusinessWorkersScreen,
	UIWorkersRedirect,
} from "./BusinessWorkersRouter";

// The web implementation accepts rootWorkspace to keep the rail visible on
// stack-level pages. The native implementation intentionally keeps its
// existing props and behavior unchanged.
const WebRootSidebar = Sidebar as React.ComponentType<
	React.ComponentProps<typeof Sidebar> & { rootWorkspace?: boolean }
>;

const AuthStack = createNativeStackNavigator<RootStackParamList>();

const AuthStackNavigator: React.FC = () => (
	<AuthStack.Navigator screenOptions={{ headerShown: false }}>
		<AuthStack.Screen name="Welcome" component={WelcomeScreen} />
		<AuthStack.Screen name="Login" component={LoginScreen} />
		<AuthStack.Screen name="Register" component={RegisterScreen} />
		<AuthStack.Screen
			name="VerificationPending"
			component={VerificationPendingScreen}
		/>
		<AuthStack.Screen
			name="ChangePassword"
			component={ChangePasswordScreen}
			options={{
				gestureEnabled: false,
			}}
		/>
	</AuthStack.Navigator>
);

const MainStack = createNativeStackNavigator<RootStackParamList>();

function webWorkspaceRoot<P extends object>(Screen: React.ComponentType<P>, title: string) {
	return function WebWorkspaceRoot(props: P) {
		if (Platform.OS !== "web") return <Screen {...props} />;
		const { user } = useAuthStore();
		return (
			<View style={{ flex: 1, flexDirection: "row" }}>
				<WebRootSidebar isAdmin={user?.role === "ADMIN"} rootWorkspace />
				<WebWorkspaceFrame title={title}><Screen {...props} /></WebWorkspaceFrame>
			</View>
		);
	};
}

const WebCashHistoryScreen = webWorkspaceRoot(CashHistoryScreen, "Historial de caja");
const WebAdminUserDetailScreen = webWorkspaceRoot(AdminUserDetailScreen, "Detalle de usuario");
const WebExchangeRatesScreen = webWorkspaceRoot(ExchangeRatesScreen, "Tasas de cambio");
const WebBankAccountsScreen = webWorkspaceRoot(BankAccountsScreen, "Cuentas bancarias");
const WebCurrenciesScreen = webWorkspaceRoot(CurrenciesScreen, "Monedas");
const WebReportsScreen = webWorkspaceRoot(ReportsScreen, "Reportes");
const WebObjectivesScreen = webWorkspaceRoot(ObjectivesScreen, "Objetivos");
const WebAdminLicensesListScreen = webWorkspaceRoot(AdminLicensesListScreen, "Licencias");
const WebAdminLicenseDetailScreen = webWorkspaceRoot(AdminLicenseDetailScreen, "Detalle de licencia");
const WebAdminAuditLogScreen = webWorkspaceRoot(AdminAuditLogScreen, "Auditoría");
const WebAdminExportReportsScreen = webWorkspaceRoot(AdminExportReportsScreen, "Exportar reportes");
const WebBusinessWorkersScreen = webWorkspaceRoot(BusinessWorkersScreen, "Trabajadores");

const MainStackNavigator: React.FC<{
	initialRouteName?: keyof RootStackParamList;
}> = ({ initialRouteName }) => {
	const { user } = useAuthStore();
	const isAdmin = user?.role === "ADMIN";

	return (
		<MainStack.Navigator
			initialRouteName={initialRouteName}
			screenOptions={{ headerShown: false }}
		>
			<MainStack.Screen
				name="Main"
				component={isAdmin ? AdminTabs : MainTabs}
			/>
			<MainStack.Screen
				name="ChangePassword"
				component={ChangePasswordScreen}
				options={{
					gestureEnabled: false,
				}}
			/>
			<MainStack.Screen
				name="AdminUserDetail"
				component={WebAdminUserDetailScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="CashHistory"
				component={WebCashHistoryScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="ExchangeRates"
				component={WebExchangeRatesScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="BankAccounts"
				component={WebBankAccountsScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="Currencies"
				component={WebCurrenciesScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="Reports"
				component={WebReportsScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="Objectives"
				component={WebObjectivesScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="AdminLicensesList"
				component={WebAdminLicensesListScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="AdminLicenseDetail"
				component={WebAdminLicenseDetailScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="AdminAuditLog"
				component={WebAdminAuditLogScreen}
				options={{ headerShown: false, presentation: "card" }}
			/>
			<MainStack.Screen
				name="AdminExportReports"
				component={WebAdminExportReportsScreen}
				options={{ headerShown: false, presentation: "card" }}
			/>
			<MainStack.Screen
				name="BusinessWorkers"
				component={WebBusinessWorkersScreen}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
			<MainStack.Screen
				name="UIWorkersRedirect"
				component={UIWorkersRedirect}
				options={{
					headerShown: false,
					presentation: "card",
				}}
			/>
		</MainStack.Navigator>
	);
};

/** Renders the push notification bootstrapper inside NavigationContainer. */
function NotificationBootstrapper() {
	usePushNotificationHandler();
	return null;
}

export const AppNavigator: React.FC = () => {
	const { isAuthenticated, isLoading, checkAuth, mustChangePassword } =
		useAuthStore();

	useEffect(() => {
		checkAuth();
	}, []);

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: colors.background,
				}}
			>
				<ActivityIndicator size="large" color={colors.primary[500]} />
			</View>
		);
	}

	// Si está autenticado pero debe cambiar contraseña, mostrar pantalla de cambio obligatorio
	if (isAuthenticated && mustChangePassword) {
		return (
			<NavigationContainer linking={Platform.OS === "web" ? webLinking : undefined}>
				<MainStackNavigator initialRouteName="ChangePassword" />
				<NotificationBootstrapper />
			</NavigationContainer>
		);
	}

	return (
		<NavigationContainer linking={Platform.OS === "web" ? webLinking : undefined}>
			{isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
			<NotificationBootstrapper />
		</NavigationContainer>
	);
};
