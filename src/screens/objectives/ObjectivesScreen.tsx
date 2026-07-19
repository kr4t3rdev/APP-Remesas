import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Alert } from "../../utils/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../../components/animations";
import { ObjectiveCard } from "../../components/objectives/ObjectiveCard";
import { ProfileFeatureBackButton } from "../profile/ProfileFeatureBackButton";
import { ObjectiveFormModal } from "../../components/objectives/ObjectiveFormModal";
import { spacing, borderRadius } from "../../theme";
import { useColors, useShadows } from "../../store/themeStore";
import type {
  Objective,
  ObjectiveStatus,
  CreateObjectiveInput,
  UpdateObjectiveInput,
} from "../../types";
import {
  useObjectivesQuery,
  useCreateObjectiveMutation,
  useUpdateObjectiveMutation,
  useUpdateObjectiveStatusMutation,
  useDeleteObjectiveMutation,
} from "../../modules/objectives/application/useObjectives";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "ACTIVO", label: "Activos" },
  { key: "COMPLETADO", label: "Completados" },
  { key: "PAUSADO", label: "Pausados" },
];

export const ObjectivesScreen: React.FC = () => {
  const themeColors = useColors();
  const themeShadows = useShadows();

  const [filter, setFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(
    null,
  );

  const selectedStatus = useMemo<ObjectiveStatus | undefined>(
    () => (filter === "all" ? undefined : (filter as ObjectiveStatus)),
    [filter],
  );

  const objectivesQuery = useObjectivesQuery(selectedStatus);
  const createMutation = useCreateObjectiveMutation();
  const updateMutation = useUpdateObjectiveMutation();
  const statusMutation = useUpdateObjectiveStatusMutation();
  const deleteMutation = useDeleteObjectiveMutation();

  const objectives = objectivesQuery.data ?? [];

  const stats = useMemo(() => {
    const activos = objectives.filter((o) => o.status === "ACTIVO").length;
    const completados = objectives.filter(
      (o) => o.status === "COMPLETADO",
    ).length;
    const pausados = objectives.filter((o) => o.status === "PAUSADO").length;
    const totalProgress =
      objectives.length > 0
        ? objectives.reduce((acc, o) => acc + (o.percentage || 0), 0) /
          objectives.length
        : 0;
    return { activos, completados, pausados, totalProgress };
  }, [objectives]);

  const handleRefresh = async () => {
    try {
      await objectivesQuery.refetch();
    } catch {
      Alert.alert("Error", "No se pudieron cargar los objetivos");
    }
  };

  const handleCreateObjective = async (
    data: CreateObjectiveInput | UpdateObjectiveInput,
  ) => {
    await createMutation.mutateAsync(data as CreateObjectiveInput);
    Alert.alert("Éxito", "Objetivo creado correctamente");
  };

  const handleUpdateObjective = async (
    data: CreateObjectiveInput | UpdateObjectiveInput,
  ) => {
    if (!editingObjective) return;
    await updateMutation.mutateAsync({
      id: editingObjective.id,
      data: data as UpdateObjectiveInput,
    });
    Alert.alert("Éxito", "Objetivo actualizado correctamente");
  };

  const handleDeleteObjective = async (objective: Objective) => {
    try {
      await deleteMutation.mutateAsync(objective.id);
      Alert.alert("Éxito", "Objetivo eliminado correctamente");
    } catch {
      Alert.alert("Error", "No se pudo eliminar el objetivo");
    }
  };

  const handleStatusChange = async (
    objective: Objective,
    newStatus: ObjectiveStatus,
  ) => {
    try {
      await statusMutation.mutateAsync({ id: objective.id, status: newStatus });
      Alert.alert("Éxito", "Estado actualizado correctamente");
    } catch {
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  const handleEditObjective = (objective: Objective) => {
    setEditingObjective(objective);
    setShowModal(true);
  };

  const handleOpenModal = () => {
    setEditingObjective(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingObjective(null);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.header}>
        <ProfileFeatureBackButton />
        <FadeInDown delay={0}>
          <View>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              Objetivos
            </Text>
            <Text
              style={[styles.subtitle, { color: themeColors.text.secondary }]}
            >
              Metas y progreso del negocio
            </Text>
          </View>
        </FadeInDown>
      </View>

      <FadeInDown delay={50}>
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.card },
              themeShadows.sm,
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: "#10B98115" }]}>
              <Ionicons name="flag" size={20} color="#10B981" />
            </View>
            <View style={styles.statInfo}>
              <Text
                style={[
                  styles.statLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Activos
              </Text>
              <Text style={[styles.statValue, { color: "#10B981" }]}>
                {stats.activos}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.card },
              themeShadows.sm,
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: "#6366F115" }]}>
              <Ionicons name="checkmark-circle" size={20} color="#6366F1" />
            </View>
            <View style={styles.statInfo}>
              <Text
                style={[
                  styles.statLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Completados
              </Text>
              <Text style={[styles.statValue, { color: "#6366F1" }]}>
                {stats.completados}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: themeColors.card },
              themeShadows.sm,
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: "#F59E0B15" }]}>
              <Ionicons name="pause-circle" size={20} color="#F59E0B" />
            </View>
            <View style={styles.statInfo}>
              <Text
                style={[
                  styles.statLabel,
                  { color: themeColors.text.secondary },
                ]}
              >
                Pausados
              </Text>
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>
                {stats.pausados}
              </Text>
            </View>
          </View>
        </View>
      </FadeInDown>

      <FadeInDown delay={100}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {FILTERS.map((f) => {
            const isSelected = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                testID={`filter-${f.key}`}
                onPress={() => setFilter(f.key)}
                style={[
                  styles.filterChip,
                  isSelected && { backgroundColor: themeColors.primary[500] },
                  !isSelected && {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isSelected ? "#fff" : themeColors.text.secondary },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </FadeInDown>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={objectivesQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary[500]}
          />
        }
      >
        {objectives.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="flag-outline"
              size={64}
              color={themeColors.text.tertiary}
            />
            <Text
              style={[styles.emptyTitle, { color: themeColors.text.primary }]}
            >
              No hay objetivos creados
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: themeColors.text.secondary },
              ]}
            >
              Toca el botón + para crear una nueva meta
            </Text>
          </View>
        ) : (
          objectives.map((objective, index) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              index={index}
              onEdit={handleEditObjective}
              onDelete={handleDeleteObjective}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        testID="add-objective-fab"
        style={[
          styles.fab,
          { backgroundColor: themeColors.primary[500] },
          themeShadows.lg,
        ]}
        onPress={handleOpenModal}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ObjectiveFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={
          editingObjective ? handleUpdateObjective : handleCreateObjective
        }
        objective={editingObjective}
        isLoading={createMutation.isPending || updateMutation.isPending}
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
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  filtersScroll: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
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
});
