import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { AdminTabParamList } from './types';
import { useColors } from '../store/themeStore';
import { AdminScreenPerfil } from '../screens/admin/AdminScreenPerfil';
import { AdminHomeScreen } from '../screens/admin/AdminHomeScreen';
import { AdminRoutes } from './adminRoutes';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { AdminReportsScreen } from '../screens/admin/AdminReportsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminTabs: React.FC = () => {
  const colors = useColors();

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
        name="AdminHome"
        component={AdminHomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminServices"
        component={AdminRoutes}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: ({ color }) => <Ionicons name="construct" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          tabBarLabel: 'Usuarios',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{
          tabBarLabel: 'Reportes',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={AdminScreenPerfil}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
