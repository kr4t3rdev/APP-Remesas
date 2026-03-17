import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader } from '../../../components/admin/layout/AdminHeader';
import { LicenseCard } from '../../../components/admin/licenses/LicenseCard';
import { licensesApi } from '../../../api/licensesApi';
import { License, LicenseStatus } from '../../../types/licenses';
import { useThemeStore, useColors } from '../../../store/themeStore';

const TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Activas' },
  { id: 'expired', label: 'Expiradas' },
  { id: 'pending', label: 'Pendientes' },
];

export const AdminLicensesListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const setTheme = useThemeStore(state => state.setTheme);
  const colors = useColors();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme, setTheme]);

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    setLoading(true);
    try {
      const data = await licensesApi.fetchLicenses();
      setLicenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLicenses = useMemo(() => {
    return licenses.filter((license) => {
      // 1. Filter by Tab
      if (activeTab !== 'all' && license.status !== activeTab) {
        return false;
      }
      // 2. Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = license.planName.toLowerCase().includes(query);
        const matchesKey = license.licenseKey.toLowerCase().includes(query);
        const matchesUser = license.assignedUsers.some(u => u.name.toLowerCase().includes(query));
        return matchesName || matchesKey || matchesUser;
      }
      return true;
    });
  }, [licenses, activeTab, searchQuery]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <AdminHeader 
        title="Listado de Licencias" 
        onBack={() => navigation.goBack()}
        // Assuming AdminHeader supports right action or we add it manually below if needed
      />
      
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1e293b' : '#f3f4f6' }]}>
          <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#9ca3af'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Buscar licencias o usuarios"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
          />
        </View>

        {/* Tabs */}
        <View style={[styles.tabsRow, { borderBottomColor: isDark ? '#334155' : '#f3f4f6' }]}>
          {TABS.map((tab) => (
            <TouchableOpacity 
              key={tab.id} 
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#3b82f6' : (isDark ? '#94a3b8' : '#6b7280') }]}>
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Licencias Recientes</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            data={filteredLicenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LicenseCard 
                license={item} 
                onPress={() => {
                  navigation.navigate('AdminLicenseDetail', { licenseId: item.id });
                }} 
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No se encontraron licencias.</Text>
            }
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // White background based on design
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 24, // Pill shape
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tabItem: {
    marginRight: 24,
    paddingBottom: 12,
    position: 'relative',
  },
  tabItemActive: {
    // Active styles handled by indicator
  },
  tabText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1, // Overlap the border
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#3b82f6',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
