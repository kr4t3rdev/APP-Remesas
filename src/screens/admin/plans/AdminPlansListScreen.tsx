import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { plansApi } from '../../../api/plansApi';
import { Plan } from '../../../types/plans';
import { AdminHeader } from '../../../components/admin/layout/AdminHeader';
import { useThemeStore } from '../../../store/themeStore';

export const AdminPlansListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const setTheme = useThemeStore(state => state.setTheme);
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme, setTheme]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await plansApi.getPlans();
      setPlans(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [])
  );

  const handleCreate = () => {
    navigation.navigate('AdminPlanCreate');
  };

  const handleEdit = (plan: Plan) => {
    navigation.navigate('AdminPlanCreate', { plan });
  };

  const renderItem = ({ item, index }: { item: Plan; index: number }) => {
    // Dynamic styles based on plan type
    const isEnterprise = item.name.toLowerCase().includes('enterprise');
    const isPro = item.isPopular;
    
    // Header background color
    let headerBg = item.themeColor || (isDark ? '#334155' : '#f3f4f6');
    // Text colors
    const titleColor = isDark ? '#f8fafc' : '#111827'; 
    const priceColor = '#3b82f6';
    const descColor = isDark ? '#94a3b8' : '#4b5563';

    return (
      <View 
        style={[styles.cardContainer, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}
      >
        <View style={[styles.cardHeader, { backgroundColor: headerBg }]}>
           {item.isPopular && (
             <View style={styles.popularBadge}>
               <Text style={styles.popularText}>MÁS POPULAR</Text>
             </View>
           )}
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.planName, { color: titleColor }]}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <Ionicons name="ellipsis-vertical" size={20} color={isDark ? '#9ca3af' : '#9ca3af'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.planPrice}>
            ${item.price === 0 ? '0' : item.price} <Text style={styles.perMonth}>/ mes</Text>
          </Text>

          <Text style={[styles.planDescription, { color: descColor }]}>{item.description}</Text>

          <View style={styles.tagsRow}>
            {(item.tags || []).map((tag, i) => (
              <View key={i} style={[styles.tag, isDark && { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="checkmark" size={12} color="#3b82f6" style={{ marginRight: 4 }} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#0f172a' }]} edges={['top', 'bottom']}>
      <AdminHeader 
        title="Planes de Suscripción" 
        onBack={() => navigation.goBack()} 
      />

      <View style={styles.container}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.createButtonText}>Crear Nuevo Plan</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            data={plans}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, isDark && { color: '#94a3b8' }]}>No hay planes configurados.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 30, // Pill shape
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
    fontSize: 16,
  },
  // Card Styles
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    height: 80, // Height for the colored top part
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 16,
  },
  popularBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 20,
    paddingTop: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 12,
  },
  perMonth: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
  },
  planDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff', // Light blue bg
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
});
