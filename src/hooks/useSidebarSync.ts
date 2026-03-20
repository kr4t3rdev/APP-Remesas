import { useEffect, useCallback, useRef } from 'react';
import { useNavigation, CommonActions, NavigationState } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/types';

/**
 * Hook that syncs sidebar navigation with BottomTabs
 * Ensures clicking sidebar item also activates correct BottomTab
 */
export const useSidebarSync = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const currentRouteRef = useRef<string>('Home');

  // Listen to navigation state changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const state = e.data.state as NavigationState | undefined;
      if (state?.routes?.length) {
        const currentRoute = state.routes[state.index || 0];
        if (currentRoute?.name) {
          currentRouteRef.current = currentRoute.name;
        }
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Navigate to a route and sync with BottomTab
  const navigateToRoute = useCallback((routeName: keyof MainTabParamList) => {
    currentRouteRef.current = routeName;
    
    // Navigate using common actions for proper state sync
    navigation.dispatch(
      CommonActions.navigate({
        name: routeName,
        merge: true,
      })
    );
  }, [navigation]);

  // Get the current active route
  const getCurrentRoute = useCallback((): string => {
    return currentRouteRef.current;
  }, []);

  // Check if a route is currently active
  const isRouteActive = useCallback((routeName: string): boolean => {
    return currentRouteRef.current === routeName;
  }, []);

  return {
    navigateToRoute,
    getCurrentRoute,
    isRouteActive,
    currentRoute: currentRouteRef.current,
  };
};

export default useSidebarSync;
