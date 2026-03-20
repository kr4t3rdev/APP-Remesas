import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { FadeInDown } from '../../components/animations';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import { useAdminAuditLogsQuery } from '../../modules/admin/application/useAdminMetrics';
import type { AdminAuditLog } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

type Category = 'Todos' | 'Usuarios' | 'Seguridad' | 'Sistema';
const CATEGORIES: Category[] = ['Todos', 'Usuarios', 'Seguridad', 'Sistema'];

type AdminAuditLogNavigation = NativeStackNavigationProp<RootStackParamList, 'AdminAuditLog'>;

const getCategoryForAction = (action: string): Category => {
  const lower = action.toLowerCase();
  if (lower.includes('password') || lower.includes('session') || lower.includes('permission') || lower.includes('auth')) return 'Seguridad';
  if (lower.includes('system') || lower.includes('config') || lower.includes('license') || lower.includes('plan')) return 'Sistema';
  return 'Usuarios';
};

const getIconForAction = (action: string) => {
  const lower = action.toLowerCase();
  if (lower.includes('role')) return 'person-circle';
  if (lower.includes('permission') || lower.includes('security')) return 'shield-checkmark';
  if (lower.includes('create') || lower.includes('add')) return 'person-add';
  if (lower.includes('config') || lower.includes('system')) return 'settings';
  if (lower.includes('password') || lower.includes('session')) return 'key';
  if (lower.includes('block') || lower.includes('suspend')) return 'lock-closed';
  return 'document-text';
};

const getColorForAction = (action: string, colors: any) => {
  const cat = getCategoryForAction(action);
  if (cat === 'Seguridad') return colors.success; // green
  if (cat === 'Sistema') return colors.warning; // yellow
  return colors.info || colors.primary[500]; // blue
};

const formatActionTitle = (action: string) => {
  const words = action.replace(/_/g, ' ').toLowerCase().split(' ');
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const groupLogsByDate = (logs: AdminAuditLog[]) => {
  const groups: { [key: string]: AdminAuditLog[] } = {};
  
  logs.forEach(log => {
    const date = new Date(log.createdAt);
    let dateLabel = '';
    
    if (isToday(date)) {
      dateLabel = 'HOY';
    } else if (isYesterday(date)) {
      dateLabel = 'AYER';
    } else {
      dateLabel = format(date, 'dd MMM yyyy', { locale: es }).toUpperCase();
    }
    
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(log);
  });
  
  return groups;
};

export const AdminAuditLogScreen: React.FC = () => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<AdminAuditLogNavigation>();
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');

  const { data: logs = [], isLoading } = useAdminAuditLogsQuery();

  const filteredLogs = useMemo(() => {
    if (selectedCategory === 'Todos') return logs;
    return logs.filter(log => getCategoryForAction(log.action) === selectedCategory);
  }, [logs, selectedCategory]);

  const groupedLogs = useMemo(() => groupLogsByDate(filteredLogs), [filteredLogs]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bitácora de Auditoría</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')} style={styles.headerRight}>
          <Ionicons name="settings" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Timeline */}
      <ScrollView contentContainerStyle={styles.timelineContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 40 }} />
        ) : filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay registros para mostrar.</Text>
          </View>
        ) : (
          Object.entries(groupedLogs).map(([dateLabel, dayLogs], groupIndex) => (
            <View key={dateLabel} style={styles.dayGroup}>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
              
              {dayLogs.map((log, index) => {
                const isLastInGroup = index === dayLogs.length - 1;
                const isLastOverall = groupIndex === Object.keys(groupedLogs).length - 1 && isLastInGroup;
                const iconName = getIconForAction(log.action);
                const actionColor = getColorForAction(log.action, colors);
                
                return (
                  <FadeInDown key={log.id} delay={index * 50} duration={300}>
                    <View style={styles.timelineRow}>
                      {/* Left Column: Timeline line and Icon */}
                      <View style={styles.timelineLeft}>
                        {!isLastOverall && <View style={styles.timelineLine} />}
                        <View style={[styles.iconContainer, { backgroundColor: `${actionColor}1A` }]}>
                          <Ionicons name={iconName as any} size={18} color={actionColor} />
                        </View>
                      </View>
                      
                      {/* Right Column: Content */}
                      <View style={styles.logCard}>
                        <View style={styles.logHeader}>
                          <Text style={styles.logTitle}>{formatActionTitle(log.action)}</Text>
                          <Text style={styles.logTime}>{format(new Date(log.createdAt), 'hh:mm a')}</Text>
                        </View>
                        
                        <Text style={styles.logReason}>
                          {log.reason || `Acción realizada sobre el objetivo ID: ${log.targetUserId || 'N/A'}`}
                        </Text>
                        
                        <View style={styles.logFooter}>
                          <View style={styles.userIconWrap}>
                            <Ionicons name="person" size={10} color={colors.text.secondary} />
                          </View>
                          <Text style={styles.logActor}>Por Admin {log.actorUserId}</Text>
                        </View>
                      </View>
                    </View>
                  </FadeInDown>
                );
              })}
            </View>
          ))
        )}

        {!isLoading && filteredLogs.length > 0 && (
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Cargar más registros</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  categoriesContainer: {
    marginBottom: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary[500] || '#1D8FFF',
    borderColor: colors.primary[500] || '#1D8FFF',
  },
  categoryText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.text.inverse || '#FFF',
  },
  timelineContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  dayGroup: {
    marginBottom: spacing.md,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginLeft: 48, // Align with the log card, past the timeline icon
    letterSpacing: 0.5,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineLine: {
    position: 'absolute',
    top: 36,
    bottom: -spacing.lg,
    width: 2,
    backgroundColor: colors.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logCard: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  logTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  logTime: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  logReason: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  logFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logActor: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  loadMoreText: {
    color: colors.primary[500] || '#1D8FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 15,
  }
});
