import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FadeInDown } from '../../components/animations';
import { WorkerCard } from '../../components/worker-payments/WorkerCard';
import { WorkerExpandableRow } from '../../components/worker-payments/WorkerExpandableRow';
import { WorkerFormModal } from '../../components/worker-payments/WorkerFormModal';
import { TransactionFormModal } from '../../components/worker-payments/TransactionFormModal';
import { AddBalanceModal } from '../../components/worker-payments/AddBalanceModal';
import { spacing, borderRadius } from '../../theme';
import { useColors, useShadows } from '../../store/themeStore';
import type { Worker, CreateWorkerInput, UpdateWorkerInput } from '../../types';
import {
  useWorkersQuery,
  useCreateWorkerMutation,
  useUpdateWorkerMutation,
  useDeleteWorkerMutation,
  useCreateTransactionMutation,
  useAddBalanceMutation,
} from '../../modules/worker-payments/application/useWorkerPayments';

export const WorkerPaymentsScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  // Estados de modals
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [expandedWorkerId, setExpandedWorkerId] = useState<number | null>(null);

  // Queries y mutations
  const workersQuery = useWorkersQuery();
  const createMutation = useCreateWorkerMutation();
  const updateMutation = useUpdateWorkerMutation();
  const deleteMutation = useDeleteWorkerMutation();
  const transactionMutation = useCreateTransactionMutation();
  const balanceMutation = useAddBalanceMutation();

  const workers = workersQuery.data ?? [];

  // Stats calculados
  const statsData = useMemo(() => {
    const totalBalance = workers.reduce((acc, w) => acc + Number(w.balance), 0);
    const totalProfit = workers.reduce((acc, w) => acc + Number(w.accumulatedProfit), 0);
    const totalDelivered = workers.reduce((acc, w) => acc + Number(w.totalDelivered), 0);

    return [
      {
        label: 'Total Saldo',
        value: `$ ${totalBalance.toLocaleString()}`,
        color: themeColors.primary[500],
        icon: 'wallet-outline' as const,
      },
      {
        label: 'Total Ganancias',
        value: `$ ${totalProfit.toLocaleString()}`,
        color: themeColors.success,
        icon: 'trending-up-outline' as const,
      },
      {
        label: 'Total Entregado',
        value: `$ ${totalDelivered.toLocaleString()}`,
        color: '#3B82F6',
        icon: 'cash-outline' as const,
      },
    ];
  }, [workers, themeColors]);

  const handleRefresh = async () => {
    try {
      await workersQuery.refetch();
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los trabajadores');
    }
  };

  // Handlers para modals
  const handleOpenWorkerModal = useCallback((worker?: Worker) => {
    setEditingWorker(worker || null);
    setShowWorkerModal(true);
  }, []);

  const handleCloseWorkerModal = useCallback(() => {
    setShowWorkerModal(false);
    setEditingWorker(null);
  }, []);

  const handleCreateWorker = async (data: CreateWorkerInput | UpdateWorkerInput) => {
    await createMutation.mutateAsync(data as CreateWorkerInput);
    Alert.alert('Éxito', 'Trabajador creado correctamente');
  };

  const handleUpdateWorker = async (data: CreateWorkerInput | UpdateWorkerInput) => {
    if (!editingWorker) return;
    await updateMutation.mutateAsync({ id: editingWorker.id, input: data as UpdateWorkerInput });
    Alert.alert('Éxito', 'Trabajador actualizado correctamente');
  };

  const handleDeleteWorker = useCallback((worker: Worker) => {
    Alert.alert(
      'Eliminar Trabajador',
      `¿Estás seguro de eliminar a "${worker.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(worker.id);
              Alert.alert('Éxito', 'Trabajador eliminado');
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el trabajador');
            }
          },
        },
      ]
    );
  }, [deleteMutation]);

  const handleOpenTransactionModal = useCallback((worker: Worker) => {
    setSelectedWorker(worker);
    setShowTransactionModal(true);
  }, []);

  const handleCloseTransactionModal = useCallback(() => {
    setShowTransactionModal(false);
    setSelectedWorker(null);
  }, []);

  const handleCreateTransaction = async (amount: number, profit: number, description?: string) => {
    if (!selectedWorker) return;
    await transactionMutation.mutateAsync({
      workerId: selectedWorker.id,
      input: { amount, profit, description },
    });
    Alert.alert('Éxito', 'Transacción registrada correctamente');
  };

  const handleOpenBalanceModal = useCallback((worker: Worker) => {
    setSelectedWorker(worker);
    setShowBalanceModal(true);
  }, []);

  const handleCloseBalanceModal = useCallback(() => {
    setShowBalanceModal(false);
    setSelectedWorker(null);
  }, []);

  const handleAddBalance = async (amount: number) => {
    if (!selectedWorker) return;
    await balanceMutation.mutateAsync({ workerId: selectedWorker.id, amount });
    Alert.alert('Éxito', 'Saldo agregado correctamente');
  };

  const handleToggleExpand = useCallback((worker: Worker) => {
    setExpandedWorkerId(prev => prev === worker.id ? null : worker.id);
  }, []);

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const isTransactionLoading = transactionMutation.isPending;
  const isBalanceLoading = balanceMutation.isPending;

  const renderWorkerItem = ({ item, index }: { item: Worker; index: number }) => {
    const isExpanded = expandedWorkerId === item.id;

    return (
      <View>
        <WorkerCard
          worker={item}
          index={index}
          onExpand={handleToggleExpand}
          onTransaction={handleOpenTransactionModal}
          onAddBalance={handleOpenBalanceModal}
          isExpanded={isExpanded}
        />
        {isExpanded && <WorkerExpandableRow worker={item} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <FadeInDown delay={0}>
          <View>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              Pagos a Trabajadores
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Gestión de pagos y transacciones
            </Text>
          </View>
        </FadeInDown>
      </View>

      <FadeInDown delay={50}>
        <View style={styles.statsRow}>
          {statsData.map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: themeColors.card }, themeShadows.sm]}
            >
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                  {stat.label}
                </Text>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </FadeInDown>

      <FlatList
        data={workers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWorkerItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={workersQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={themeColors.text.tertiary} />
            <Text style={[styles.emptyTitle, { color: themeColors.text.primary }]}>
              No hay trabajadores registrados
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.text.secondary }]}>
              Toca el botón + para agregar el primer trabajador
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        testID="add-worker-fab"
        style={[styles.fab, { backgroundColor: themeColors.primary[500] }, themeShadows.lg]}
        onPress={() => handleOpenWorkerModal()}
        activeOpacity={0.8}
      >
        <Ionicons name="person-add" size={24} color={themeColors.text.inverse} />
      </TouchableOpacity>

      <WorkerFormModal
        visible={showWorkerModal}
        onClose={handleCloseWorkerModal}
        onSubmit={editingWorker ? handleUpdateWorker : handleCreateWorker}
        worker={editingWorker}
        isLoading={isLoading}
      />

      <TransactionFormModal
        visible={showTransactionModal}
        onClose={handleCloseTransactionModal}
        onSubmit={handleCreateTransaction}
        worker={selectedWorker}
        isLoading={isTransactionLoading}
      />

      <AddBalanceModal
        visible={showBalanceModal}
        onClose={handleCloseBalanceModal}
        onSubmit={handleAddBalance}
        worker={selectedWorker}
        isLoading={isBalanceLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
