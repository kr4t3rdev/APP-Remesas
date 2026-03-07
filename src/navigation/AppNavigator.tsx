import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { CashHistoryScreen } from '../screens/cash/CashHistoryScreen';
import { ExchangeRatesScreen } from '../screens/exchange-rates/ExchangeRatesScreen';
import { BankAccountsScreen } from '../screens/bank-accounts/BankAccountsScreen';
import { CurrenciesScreen } from '../screens/currencies/CurrenciesScreen';
import { MainTabs } from './MainTabs';
import { AdminTabs } from './AdminTabs';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

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

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={isAdmin ? AdminTabs : MainTabs} />
            <Stack.Screen 
              name="CashHistory" 
              component={CashHistoryScreen}
              options={{ 
                headerShown: false,
                presentation: 'card'
              }}
            />
            <Stack.Screen 
              name="ExchangeRates" 
              component={ExchangeRatesScreen}
              options={{ 
                headerShown: false,
                presentation: 'card'
              }}
            />
            <Stack.Screen 
              name="BankAccounts" 
              component={BankAccountsScreen}
              options={{ 
                headerShown: false,
                presentation: 'card'
              }}
            />
            <Stack.Screen 
              name="Currencies" 
              component={CurrenciesScreen}
              options={{ 
                headerShown: false,
                presentation: 'card'
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
