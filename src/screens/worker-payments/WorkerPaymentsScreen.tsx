import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileFeatureBackButton } from "../profile/ProfileFeatureBackButton";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown, ScaleIn } from "../../components/animations";
import { WorkerCard } from "../../components/worker-payments/WorkerCard";
import { WorkerExpandableRow } from "../../components/worker-payments/WorkerExpandableRow";
import { WorkerFormModal } from "../../components/worker-payments/WorkerFormModal";
import { TransactionModal } from "../../components/business/modals/TransactionModal";
import { AddBalanceModal } from "../../components/worker-payments/AddBalanceModal";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type { Worker, CreateWorkerInput } from "../../types";
import {
  useWorkersQuery,
  useWorkerDetailQuery,
  useCreateWorkerMutation,
  useUpdateWorkerMutation,
  useDeleteWorkerMutation,
  useAddBalanceMutation,
  useDepositMutation,
} from "../../modules/worker-payments/application/useWorkerPayments";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { BREAKPOINTS } from "../../hooks/useResponsive";

export const WorkerPaymentsScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= BREAKPOINTS.tablet;

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "primary" | "warning";
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Estados de modals
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [expandedWorkerId, setExpandedWorkerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Queries y mutations
  const workersQuery = useWorkersQuery();
  const createMutation = useCreateWorkerMutation();
  const updateMutation = useUpdateWorkerMutation();
  const deleteMutation = useDeleteWorkerMutation();
  const balanceMutation = useAddBalanceMutation();
  const depositMutation = useDepositMutation();
  const workerDetailQuery = useWorkerDetailQuery(expandedWorkerId ?? 0);

  const workers = workersQuery.data ?? [];
  const workersBySearch = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return workers;
    }
    return workers.filter((worker) =>
      worker.name.toLowerCase().includes(normalizedTerm),
    );
  }, [workers, searchTerm]);

  const payrollData = useMemo(() => {
    const totalBalance = workers.reduce((acc, w) => acc + Number(w.balance), 0);
    return {
      totalPayroll: `$${totalBalance.toLocaleString()}`,
    };
  }, [workers]);

  const handleRefresh = async () => {
    try {
      await workersQuery.refetch();
    } catch {
      Alert.alert("Error", "No se pudieron cargar los trabajadores");
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

  const handleCreateWorker = async (data: CreateWorkerInput) => {
    try {
      await createMutation.mutateAsync(data);
      Alert.alert("Éxito", "Trabajador creado correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el trabajador");
      throw error;
    }
  };

  const handleUpdateWorker = async (data: CreateWorkerInput) => {
    try {
      if (!editingWorker) return;
      await updateMutation.mutateAsync({
        id: editingWorker.id,
        input: data,
      });
      Alert.alert("Éxito", "Trabajador actualizado correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el trabajador");
      throw error;
    }
  };

  const handleDeleteWorker = useCallback(
    (worker: Worker) => {
      setConfirmModal({
        visible: true,
        title: "Eliminar Trabajador",
        message: `¿Estás seguro de eliminar a "${worker.name}"?`,
        variant: "danger",
        onConfirm: async () => {
          setConfirmModal((prev) => ({ ...prev, visible: false }));
          try {
            await deleteMutation.mutateAsync(worker.id);
            Alert.alert("Éxito", "Trabajador eliminado");
          } catch {
            Alert.alert("Error", "No se pudo eliminar el trabajador");
          }
        },
      });
    },
    [deleteMutation],
  );

  const handleOpenTransactionModal = useCallback(
    (worker: Worker) => {
      setSelectedWorker(worker);
      setShowTransactionModal(true);
    },
    [],
  );

  const handleCloseTransactionModal = useCallback(() => {
    setShowTransactionModal(false);
    setSelectedWorker(null);
  }, []);

  const handleOpenBalanceModal = useCallback(
    (worker: Worker) => {
      setSelectedWorker(worker);
      setShowBalanceModal(true);
    },
    [],
  );

  const handleCloseBalanceModal = useCallback(() => {
    setShowBalanceModal(false);
    setSelectedWorker(null);
  }, []);

  const handleAddBalance = async (data: {
    amount: number;
    sourceType?: "CASH" | "BANK_ACCOUNT";
    sourceId?: number;
    currencyId?: number;
  }) => {
    if (!selectedWorker) return;
    try {
      await balanceMutation.mutateAsync({
        workerId: selectedWorker.id,
        ...data,
      });
      Alert.alert("Éxito", "Saldo agregado correctamente");
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo agregar el saldo. Intentá de nuevo.";
      Alert.alert("Error", backendMessage);
      throw error;
    }
  };

  const handleOpenDepositModal = useCallback(
    (worker: Worker) => {
      setSelectedWorker(worker);
      setShowDepositModal(true);
    },
    [],
  );

  const handleCloseDepositModal = useCallback(() => {
    setShowDepositModal(false);
    setSelectedWorker(null);
  }, []);

  const handleDeposit = async (data: {
    amount: number;
    destinationType?: "CASH" | "BANK_ACCOUNT";
    destinationId?: number;
    currencyId?: number;
  }) => {
    if (!selectedWorker) return;
    try {
      await depositMutation.mutateAsync({
        workerId: selectedWorker.id,
        ...data,
      });
      Alert.alert("Éxito", "Depósito realizado correctamente");
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo realizar el depósito. Intentá de nuevo.";
      Alert.alert("Error", backendMessage);
      throw error;
    }
  };

  const handleToggleExpand = useCallback(
    (worker: Worker) => {
      setExpandedWorkerId((prev) =>
        prev === worker.id ? null : worker.id,
      );
    },
    [],
  );

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  const isBalanceLoading = balanceMutation.isPending;
  const isDepositLoading = depositMutation.isPending;

  const renderWorkerItem = ({
    item,
    index,
  }: {
    item: Worker;
    index: number;
  }) => {
    const isExpanded = expandedWorkerId === item.id;
    const expandedWorker = isExpanded
      ? (workerDetailQuery.data ?? item)
      : item;

    return (
      <View>
        <WorkerCard
          worker={item}
          index={index}
          onExpand={handleToggleExpand}
          onTransaction={handleOpenTransactionModal}
          onAddBalance={handleOpenBalanceModal}
          onDeposit={handleOpenDepositModal}
          onEdit={handleOpenWorkerModal}
          onDelete={handleDeleteWorker}
          isExpanded={isExpanded}
        />
        {isExpanded && <WorkerExpandableRow worker={expandedWorker} />}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {isWebDesktop ? (
        <View style={styles.webTopBar}>
          <ProfileFeatureBackButton />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Nuevo trabajador"
            onPress={() => handleOpenWorkerModal()}
            style={[
              styles.headerAction,
              { backgroundColor: themeColors.primary[500] },
            ]}
          >
            <Ionicons name="add" size={20} color={themeColors.text.inverse} />
            <Text
              style={[
                styles.headerActionText,
                { color: themeColors.text.inverse },
              ]}
            >
              Nuevo trabajador
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ProfileFeatureBackButton />
      )}
      <View style={styles.header}>
        <FadeInDown delay={0}>
          <View>
            {/* <Text style={[styles.title, { color: themeColors.text.primary }]}>
            Trabajadores
            </Text> */}
          </View>
        </FadeInDown>
      </View>

      <FadeInDown delay={50}>
        <View
          style={[
            styles.contentSection,
            isWebDesktop && styles.webContentSection,
          ]}
        >
          <View
            style={[styles.searchBar, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 }]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={themeColors.text.tertiary}
            />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Buscar trabajador por nombre..."
              placeholderTextColor={themeColors.text.tertiary}
              style={[styles.searchInput, { color: themeColors.text.primary }]}
            />
          </View>
        </View>
      </FadeInDown>

      <FlatList
        data={workersBySearch}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWorkerItem}
        contentContainerStyle={[
          styles.listContent,
          isWebDesktop && styles.webListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={workersQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color={themeColors.text.tertiary}
            />
            <Text
              style={[styles.emptyTitle, { color: themeColors.text.primary }]}
            >
              No hay trabajadores registrados
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: themeColors.text.secondary },
              ]}
            >
              Toca + para agregar un nuevo trabajador
            </Text>
          </View>
        }
      />

      <ScaleIn delay={200}>
        {!isWebDesktop ? (
          <TouchableOpacity
            style={[
              styles.fab,
              { backgroundColor: themeColors.primary[500] },
              { ...themeShadows.glow, shadowColor: themeColors.primary[500] },
            ]}
            onPress={() => handleOpenWorkerModal()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Nuevo trabajador"
          >
            <Ionicons name="add" size={28} color={themeColors.text.inverse} />
          </TouchableOpacity>
        ) : null}
      </ScaleIn>

      <WorkerFormModal
        visible={showWorkerModal}
        onClose={handleCloseWorkerModal}
        onSubmit={editingWorker ? handleUpdateWorker : handleCreateWorker}
        worker={editingWorker}
        recentWorkers={workers}
        isLoading={isLoading}
      />

      {showTransactionModal ? (
        <TransactionModal
          visible
          onClose={handleCloseTransactionModal}
          worker={selectedWorker}
        />
      ) : null}

      <AddBalanceModal
        visible={showBalanceModal}
        onClose={handleCloseBalanceModal}
        onSubmit={handleAddBalance}
        worker={selectedWorker}
        isLoading={isBalanceLoading}
        mode="add"
      />

      <AddBalanceModal
        visible={showDepositModal}
        onClose={handleCloseDepositModal}
        onSubmit={handleDeposit}
        worker={selectedWorker}
        isLoading={isDepositLoading}
        mode="deposit"
      />

      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal((prev) => ({ ...prev, visible: false }))
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webTopBar: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  headerActionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  contentSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  webContentSection: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.xs,
    height: 42,
    fontSize: 14,
  },
  payrollRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  payrollLabel: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  payrollValue: {
    fontSize: 44,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  webListContent: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
