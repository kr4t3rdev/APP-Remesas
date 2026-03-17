import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ChangePasswordScreen } from '../screens/auth/ChangePasswordScreen';
import { CashHistoryScreen } from '../screens/cash/CashHistoryScreen';
import { ExchangeRatesScreen } from '../screens/exchange-rates/ExchangeRatesScreen';
import { BankAccountsScreen } from '../screens/bank-accounts/BankAccountsScreen';
import { CurrenciesScreen } from '../screens/currencies/CurrenciesScreen';
import { ReconciliationsHistoryScreen } from '../screens/reconciliations/ReconciliationsHistoryScreen';
import { BulkReconciliationScreen } from '../screens/reconciliations/BulkReconciliationScreen';
import { MainTabs } from './MainTabs';
import { AdminTabs } from './AdminTabs';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import type { RootStackParamList } from './types';
import { AdminUserDetailScreen } from '../screens/admin/AdminUserDetailScreen';
import { AdminLicensesListScreen } from '../screens/admin/licenses/AdminLicensesListScreen';
import { AdminLicenseDetailScreen } from '../screens/admin/licenses/AdminLicenseDetailScreen';

const AuthStack = createNativeStackNavigator<RootStackParamList>();

const AuthStackNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
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

const MainStackNavigator: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Main" component={isAdmin ? AdminTabs : MainTabs} />
      <MainStack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ 
          gestureEnabled: false,
        }}
      />
      <MainStack.Screen 
        name="AdminUserDetail" 
        component={AdminUserDetailScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <MainStack.Screen 
        name="CashHistory" 
        component={CashHistoryScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <MainStack.Screen 
        name="ExchangeRates" 
        component={ExchangeRatesScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <MainStack.Screen 
        name="BankAccounts" 
        component={BankAccountsScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <MainStack.Screen 
        name="Currencies" 
        component={CurrenciesScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <MainStack.Screen 
        name="ReconciliationsHistory" 
        component={ReconciliationsHistoryScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <MainStack.Screen 
        name="BulkReconciliation" 
        component={BulkReconciliationScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <MainStack.Screen 
        name="AdminLicensesList" 
        component={AdminLicensesListScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <MainStack.Screen 
        name="AdminLicenseDetail" 
        component={AdminLicenseDetailScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
    </MainStack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth, user, mustChangePassword } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  // Si está autenticado pero debe cambiar contraseña, mostrar pantalla de cambio obligatorio
  if (isAuthenticated && mustChangePassword) {
    return (
      <NavigationContainer>
        <MainStackNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainStackNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};
