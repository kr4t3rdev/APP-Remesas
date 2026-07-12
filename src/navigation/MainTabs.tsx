import React from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { TransactionsScreen } from "../screens/transactions/TransactionsScreen";
import { ExpenseItemsScreen } from "../screens/expense-items/ExpenseItemsScreen";
import { ReportsScreen } from "../screens/reports/ReportsScreen";
import { BusinessScreen } from "../screens/business/BusinessScreen";
import type { MainTabParamList } from "./types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsDark } from "../store/themeStore";
import {
  fintechTabBarColors,
  getFintechTabBarStyle,
} from "./fintechTabBar";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDark = useIsDark();
  const tabBarColors = fintechTabBarColors[isDark ? "dark" : "light"];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: getFintechTabBarStyle(insets.bottom, isDark),
        tabBarActiveTintColor: tabBarColors.active,
        tabBarInactiveTintColor: tabBarColors.inactive,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          paddingVertical: 0,
        },
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
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="home"
              color={color}
              focused={focused}
              activeBackground={tabBarColors.activeBackground}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Business"
        component={BusinessScreen}
        options={{
          tabBarLabel: "Negocios",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="briefcase"
              color={color}
              focused={focused}
              activeBackground={tabBarColors.activeBackground}
            />
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
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="receipt"
              color={color}
              focused={focused}
              activeBackground={tabBarColors.activeBackground}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: "Reportes",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="bar-chart"
              color={color}
              focused={focused}
              activeBackground={tabBarColors.activeBackground}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="person"
              color={color}
              focused={focused}
              activeBackground={tabBarColors.activeBackground}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

import { Ionicons } from "@expo/vector-icons";

type TabBarIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  activeBackground: string;
};

const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  color,
  focused,
  activeBackground,
}) => {
  return (
    <View
      style={[
        styles.iconContainer,
        focused && { backgroundColor: activeBackground },
      ]}
    >
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 28,
    borderRadius: 14,
  },
});
