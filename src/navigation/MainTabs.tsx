import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const PlaceholderScreen: React.FC = () => (
  <React.Fragment />
);

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Transacciones',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="swap-horizontal" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cash"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Caja',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="wallet" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Reportes',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="chart-bar" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="account" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

import { View, Text } from 'react-native';

type TabBarIconProps = {
  name: string;
  color: string;
};

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color }) => {
  const icons: Record<string, string> = {
    home: '🏠',
    'swap-horizontal': '💱',
    wallet: '💵',
    'chart-bar': '📊',
    account: '👤',
  };

  return (
    <View
      style={{
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 20 }}>{icons[name] || '•'}</Text>
    </View>
  );
};
