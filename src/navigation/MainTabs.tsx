import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { TransactionsScreen } from "../screens/transactions/TransactionsScreen";
import { ExpenseItemsScreen } from "../screens/expense-items/ExpenseItemsScreen";
import { ReportsScreen } from "../screens/reports/ReportsScreen";
import { BusinessScreen } from "../screens/business/BusinessScreen";
import { useColors } from "../store/themeStore";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs: React.FC = () => {
  const themeColors = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.border,
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarActiveTintColor: themeColors.primary[500],
        tabBarInactiveTintColor: themeColors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tab.Screen
        name="Business"
        component={BusinessScreen}
        options={{
          tabBarLabel: "Negocios",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="briefcase" color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarLabel: 'Transacciones',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="swap-horizontal" color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="ExpenseItems"
        component={ExpenseItemsScreen}
        options={{
          tabBarLabel: "Gastos",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="receipt" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: "Reportes",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bar-chart" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

import { Ionicons } from "@expo/vector-icons";

type TabBarIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
};

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color }) => {
  return <Ionicons name={name} size={24} color={color} />;
};
