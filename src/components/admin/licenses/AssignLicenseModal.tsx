import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useShadows } from "../../../store/themeStore";
import { borderRadius, spacing } from "../../../theme";
import { plansApi } from "../../../api/plansApi";
import {
  licensesApi,
  BillingCycle,
  AssignLicensePayload,
} from "../../../api/licensesApi";
import { adminRepository } from "../../../modules/admin/infrastructure/admin.repository";
import type { Plan } from "../../../types/plans";
import type { User } from "../../../types";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";

type AssignLicenseModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
};

const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "MONTHLY", label: "Mensual" },
  { value: "SEMIANNUAL", label: "Semestral" },
  { value: "ANNUAL", label: "Anual" },
];

export const AssignLicenseModal: React.FC<AssignLicenseModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(
    () => createStyles(colors, shadows),
    [colors, shadows],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("MONTHLY");
  const [customExpiry, setCustomExpiry] = useState<string>("");

  // Search
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const [fetchedUsers, fetchedPlans] = await Promise.all([
        adminRepository.getUsers(),
        plansApi.getPlans(),
      ]);
      setUsers(fetchedUsers);
      setPlans(fetchedPlans.filter((p) => p.isActive));
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Error al cargar datos");
    } finally {
      setLoadingData(false);
    }
  };

  const resetState = () => {
    setSelectedUserIds(new Set());
    setSelectedPlanId(null);
    setSelectedCycle("MONTHLY");
    setCustomExpiry("");
    setError(null);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const getFilteredUsers = () => {
    if (!userSearch.trim()) return users;
    const search = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search),
    );
  };

  const handleAssign = async () => {
    if (selectedUserIds.size === 0) {
      setError("Selecciona al menos un usuario");
      return;
    }
    if (!selectedPlanId) {
      setError("Selecciona un plan");
      return;
    }

    setLoading(true);
    setError(null);

    const ids = Array.from(selectedUserIds);
    const planId = parseInt(selectedPlanId, 10);

    const results = await Promise.allSettled(
      ids.map((userId) => {
        const payload: AssignLicensePayload = {
          userId,
          planId,
          cycle: selectedCycle,
        };
        if (customExpiry.trim()) {
          payload.expiresAt = customExpiry.trim();
        }
        return licensesApi.assignLicense(payload);
      }),
    );

    const fulfilled = results.filter((r) => r.status === "fulfilled").length;
    const rejected = results.filter((r) => r.status === "rejected");
    const failedUserIds = ids.filter(
      (_, index) => results[index].status === "rejected",
    );
    const failures = rejected.map((r) => {
      const err = (r as PromiseRejectedResult).reason;
      return (
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : "Error desconocido")
      );
    });

    if (rejected.length === 0) {
      resetState();
      onSuccess();
    } else if (fulfilled === 0) {
      const backendMessage = failures[0];
      setError(backendMessage || "Error al asignar licencias");
    } else {
      setSelectedUserIds(new Set(failedUserIds));
      setError(
        `${fulfilled} asignada(s). ${rejected.length} fallaron: ${failures[0]}`,
      );
    }

    setLoading(false);
  };

  const filteredUsers = getFilteredUsers();
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Asignar Licencia</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Cerrar diálogo de asignación">
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Users Section */}
            <Text style={styles.sectionTitle}>
              Usuarios ({selectedUserIds.size} seleccionados)
            </Text>
            <Input
              placeholder="Buscar usuarios..."
              value={userSearch}
              onChangeText={setUserSearch}
              containerStyle={styles.searchInput}
            />

            <TouchableOpacity
              style={[
                styles.selectAllRow,
                {
                  backgroundColor:
                    selectedUserIds.size === filteredUsers.length &&
                    filteredUsers.length > 0
                      ? `${colors.primary[500]}20`
                      : colors.background,
                },
              ]}
              onPress={toggleSelectAll}
              disabled={filteredUsers.length === 0}
              accessibilityRole="checkbox"
              accessibilityState={{
                checked:
                  selectedUserIds.size === filteredUsers.length &&
                  filteredUsers.length > 0,
              }}
              accessibilityLabel="Seleccionar todos los usuarios"
            >
              <Ionicons
                name={
                  selectedUserIds.size === filteredUsers.length &&
                  filteredUsers.length > 0
                    ? "checkbox"
                    : "square-outline"
                }
                size={20}
                color={colors.primary[500]}
              />
              <Text style={styles.selectAllText}>Seleccionar todos</Text>
            </TouchableOpacity>

            <View style={styles.userList}>
              {loadingData ? (
                <Text style={styles.loadingText}>Cargando usuarios...</Text>
              ) : filteredUsers.length === 0 ? (
                <Text style={styles.emptyText}>No se encontraron usuarios</Text>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.has(user.id);
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.userRow,
                        isSelected && {
                          backgroundColor: `${colors.primary[500]}10`,
                        },
                      ]}
                      onPress={() => toggleUser(user.id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={`Seleccionar usuario ${user.name}`}
                    >
                      <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={20}
                        color={
                          isSelected
                            ? colors.primary[500]
                            : colors.text.secondary
                        }
                      />
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Plan Section */}
            <Text style={styles.sectionTitle}>Plan</Text>
            <View style={styles.planList}>
              {plans.length === 0 ? (
                <Text style={styles.loadingText}>Cargando planes...</Text>
              ) : (
                plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planItem,
                        {
                          borderColor: isSelected
                            ? colors.primary[500]
                            : colors.border,
                        },
                        isSelected && {
                          backgroundColor: `${colors.primary[500]}10`,
                        },
                      ]}
                      onPress={() => setSelectedPlanId(plan.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Plan ${plan.name}, ${plan.price} USD`}
                    >
                      <View
                        style={[
                          styles.planIcon,
                          {
                            backgroundColor:
                              plan.themeColor || colors.primary[500],
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            plan.icon === "diamond"
                              ? "diamond"
                              : plan.icon === "rocket"
                                ? "rocket"
                                : plan.icon === "flash"
                                  ? "flash"
                                  : "star"
                          }
                          size={16}
                          color={colors.text.inverse}
                        />
                      </View>
                      <View style={styles.planInfo}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planPrice}>${plan.price} USD</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Billing Cycle Section */}
            <Text style={styles.sectionTitle}>Ciclo de Facturación</Text>
            <View style={styles.cycleRow}>
              {BILLING_CYCLES.map((cycle) => {
                const isSelected = selectedCycle === cycle.value;
                return (
                  <TouchableOpacity
                    key={cycle.value}
                    style={[
                      styles.cycleItem,
                      {
                        borderColor: isSelected
                          ? colors.primary[500]
                          : colors.border,
                      },
                      isSelected && {
                        backgroundColor: `${colors.primary[500]}10`,
                      },
                    ]}
                    onPress={() => setSelectedCycle(cycle.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Ciclo ${cycle.label}`}
                  >
                    <Text
                      style={[
                        styles.cycleText,
                        isSelected && {
                          color: colors.primary[500],
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {cycle.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Expiry (Optional) */}
            <Text style={styles.sectionTitle}>
              Fecha de Vencimiento (opcional)
            </Text>
            <Input
              placeholder="YYYY-MM-DD"
              value={customExpiry}
              onChangeText={setCustomExpiry}
            />
            <Text style={styles.hintText}>
              Dejar vacío para calcular según el ciclo
            </Text>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Cancelar asignación"
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Button
              title={
                loading
                  ? "Asignando..."
                  : `Asignar a ${selectedUserIds.size} usuario${selectedUserIds.size !== 1 ? "s" : ""}`
              }
              onPress={handleAssign}
              loading={loading}
              disabled={selectedUserIds.size === 0 || !selectedPlanId}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (
  colors: ReturnType<typeof useColors>,
  shadows: ReturnType<typeof useShadows>,
) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      padding: spacing.md,
    },
    dialog: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      maxHeight: "92%",
      ...shadows.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.primary,
    },
    closeButton: {
      padding: spacing.xs,
    },
    content: {
      padding: spacing.md,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    searchInput: {
      marginBottom: spacing.sm,
    },
    selectAllRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    selectAllText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.primary[500],
    },
    userList: {
      maxHeight: 180,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.sm,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.primary,
    },
    userEmail: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    loadingText: {
      padding: spacing.md,
      textAlign: "center",
      color: colors.text.secondary,
    },
    emptyText: {
      padding: spacing.md,
      textAlign: "center",
      color: colors.text.tertiary,
    },
    planList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    planItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      gap: spacing.sm,
      flex: 1,
      minWidth: 140,
    },
    planIcon: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    planInfo: {
      flex: 1,
    },
    planName: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.primary,
    },
    planPrice: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    cycleRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    cycleItem: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      alignItems: "center",
    },
    cycleText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    hintText: {
      fontSize: 12,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.md,
      padding: spacing.sm,
      backgroundColor: `${colors.danger}10`,
      borderRadius: borderRadius.md,
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      flex: 1,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelButton: {
      minHeight: 44,
      justifyContent: "center",
      paddingHorizontal: spacing.md,
    },
    cancelText: {
      color: colors.text.secondary,
      fontWeight: "600",
      fontSize: 16,
    },
  });
