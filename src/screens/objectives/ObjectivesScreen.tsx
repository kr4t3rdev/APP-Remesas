import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import type { Objective, ObjectiveStatus } from '../../types';
import { useObjectivesQuery } from '../../modules/objectives/application/useObjectives';

export const ObjectivesScreen: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const selectedStatus = useMemo<ObjectiveStatus | undefined>(
    () => (filter === 'all' ? undefined : (filter as ObjectiveStatus)),
    [filter]
  );
  const objectivesQuery = useObjectivesQuery(selectedStatus);
  const objectives = objectivesQuery.data ?? [];

  const handleRefresh = async () => {
    try {
      await objectivesQuery.refetch();
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los objetivos');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO':
        return colors.success;
      case 'COMPLETADO':
        return colors.primary[500];
      case 'PAUSADO':
        return colors.warning;
      default:
        return colors.text.secondary;
    }
  };

  const renderObjective = (objective: Objective) => {
    const progress = Math.min(objective.percentage || 0, 100);
    const progressColor = progress >= 100 ? colors.success : colors.primary[500];

    return (
      <TouchableOpacity
        key={objective.id}
        style={{
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.sm,
          ...shadows.sm,
        }}
        onPress={() => Alert.alert('Detalle', `Objetivo: ${objective.name}`)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
              {objective.name}
            </Text>
            {objective.description && (
              <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
                {objective.description}
              </Text>
            )}
          </View>
          <Badge
            text={objective.status}
            variant={objective.status === 'ACTIVO' ? 'success' : objective.status === 'COMPLETADO' ? 'info' : 'warning'}
          />
        </View>

        <View style={{ marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>Progreso</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: progressColor }}>
              {progress.toFixed(1)}%
            </Text>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: colors.border,
              borderRadius: borderRadius.full,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: progressColor,
                borderRadius: borderRadius.full,
              }}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing.md,
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.separator,
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: colors.text.secondary }}>Actual</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
              $ {Number(objective.currentAmount).toLocaleString()}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: colors.text.secondary }}>Meta</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
              $ {Number(objective.targetAmount).toLocaleString()}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: colors.text.secondary }}>Falta</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
              $ {Number(objective.remaining || 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'ACTIVO', label: 'Activos' },
    { key: 'COMPLETADO', label: 'Completados' },
    { key: 'PAUSADO', label: 'Pausados' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary }}>
          Objetivos
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
          Metas y progreso del negocio
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: borderRadius.full,
              backgroundColor: filter === f.key ? colors.primary[500] : colors.card,
              marginRight: spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: filter === f.key ? '#fff' : colors.text.secondary,
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={objectivesQuery.isRefetching} onRefresh={handleRefresh} />
        }
      >
        {objectives.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Ionicons name="flag-outline" size={48} color={colors.text.tertiary} />
            <Text style={{ fontSize: 16, color: colors.text.secondary, marginTop: spacing.md }}>
              No hay objetivos creados
            </Text>
          </View>
        ) : (
          objectives.map(renderObjective)
        )}
      </ScrollView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: spacing.lg,
          right: spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary[500],
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.lg,
        }}
        onPress={() => Alert.alert('Nuevo Objetivo', 'Crear nueva meta')}
      >
        <Text style={{ fontSize: 28, color: '#fff' }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
