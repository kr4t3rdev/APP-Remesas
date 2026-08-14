import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { TransactionsScreen } from "../screens/transactions/TransactionsScreen";
import { ExpensesScreen } from "../screens/expenses/ExpensesScreen";
import { CashScreen } from "../screens/cash/CashScreen";
import { ReportsScreen } from "../screens/reports/ReportsScreen";
import type { MainTabParamList } from "./types";
import { mainTabDefinitions } from "./mainTabsConfig";
import { ResponsiveTabBar } from "./responsiveShell";
import { TabBarMotionProvider } from "./TabBarMotionProvider";
import { useResponsive, BREAKPOINTS } from "../hooks/useResponsive";
import { WebWorkspaceFrame } from "../web/workspace/WebWorkspaceFrame";

type WebMainTabParamList = MainTabParamList & { Reports: undefined };
const Tab = createBottomTabNavigator<WebMainTabParamList>();

const screenComponents = {
  Home: HomeScreen,
  Transactions: TransactionsScreen,
  Cash: CashScreen,
  Expenses: ExpensesScreen,
  Profile: ProfileScreen,
  Reports: ReportsScreen,
} as const;

const screenTitles: Record<keyof WebMainTabParamList, string> = {
  Home: "Inicio",
  Transactions: "Transacciones",
  Cash: "Caja",
  Expenses: "Gastos",
  Profile: "Perfil",
  Reports: "Reportes",
};

function workspaceScreen(route: keyof WebMainTabParamList) {
  const Screen = screenComponents[route];
  return function WebUserWorkspaceScreen(props: object) {
    return (
      <WebWorkspaceFrame title={screenTitles[route]}>
        <Screen {...props} />
      </WebWorkspaceFrame>
    );
  };
}

const workspaceScreens = {
  Home: workspaceScreen("Home"),
  Transactions: workspaceScreen("Transactions"),
  Cash: workspaceScreen("Cash"),
  Expenses: workspaceScreen("Expenses"),
  Profile: workspaceScreen("Profile"),
  Reports: workspaceScreen("Reports"),
} as const;

export const MainTabs: React.FC = () => {
  const { width } = useResponsive();
  const isWebDesktop = width >= BREAKPOINTS.tablet;

  return (
    <TabBarMotionProvider>
      <Tab.Navigator
        tabBar={(props) => <ResponsiveTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarPosition: isWebDesktop ? "left" : "bottom",
        }}
      >
        {mainTabDefinitions.map(({ route, label }) => (
          <Tab.Screen
            key={route}
            name={route}
            component={workspaceScreens[route]}
            options={{ tabBarLabel: label }}
          />
        ))}
        <Tab.Screen
          name="Reports"
          component={workspaceScreens.Reports}
          options={{
            tabBarLabel: "Reportes",
            tabBarButton: isWebDesktop ? undefined : () => null,
          }}
        />
      </Tab.Navigator>
    </TabBarMotionProvider>
  );
};
