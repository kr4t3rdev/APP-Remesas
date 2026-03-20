import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useColors } from '../../store/themeStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useResponsiveStore } from '../../store/responsiveStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  showHeader?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  isAdmin = false,
  showHeader = true 
}) => {
  const colors = useColors();
  const { isMobile } = useResponsive();
  const { hydrate, isHydrated } = useResponsiveStore();

  // Hydrate persisted sidebar state on mount
  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  // Mobile: render children directly (BottomTabs mode)
  if (isMobile) {
    return <>{children}</>;
  }

  // Tablet/Desktop: use sidebar + header layout
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Sidebar isAdmin={isAdmin} />
      <View style={styles.mainContent}>
        {showHeader && <Header />}
        <ScrollView 
          style={[styles.contentArea, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});

export default MainLayout;
