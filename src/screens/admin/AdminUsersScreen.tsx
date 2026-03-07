import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FadeIn, FadeInDown, SlideInRightAnim } from '../../components/animations';
import { UserActionConfirmModal } from '../../components/admin/UserActionConfirmModal';
import { UserControlActionCard } from '../../components/admin/UserControlActionCard';
import { AddUserFormModal } from '../../components/admin/AddUserFormModal';
import {
  useCreateAdminUserMutation,
  useAdminUpdateUserBasicMutation,
  useAdminUserControlActionMutation,
  useAdminUserDetailQuery,
  useAdminUsersQuery,
} from '../../modules/admin/application/useAdminMetrics';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { AdminCreateUserRequest, AdminUserControlActionType, User, UserRole } from '../../types';
import { getApiErrorMessage } from '../../utils/apiError';

type FilterState = 'all' | 'active' | 'blocked';

const actionDefinitions: Array<{
  actionType: AdminUserControlActionType;
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  sensitive: boolean;
}> = [
  {
    actionType: 'TEMP_BLOCK',
    title: 'Bloquear temporalmente',
    description: 'Bloquea acceso inmediato por riesgo operativo puntual.',
    risk: 'medium',
    sensitive: false,
  },
  {
    actionType: 'UNBLOCK',
    title: 'Desbloquear usuario',
    description: 'Restablece acceso si la revisión fue satisfactoria.',
    risk: 'low',
    sensitive: false,
  },
  {
    actionType: 'SUSPEND_ACCOUNT',
    title: 'Suspender cuenta',
    description: 'Inhabilita uso de la cuenta hasta intervención administrativa.',
    risk: 'high',
    sensitive: true,
  },
  {
    actionType: 'REACTIVATE_ACCOUNT',
    title: 'Reactivar cuenta',
    description: 'Devuelve la cuenta al estado operativo normal.',
    risk: 'low',
    sensitive: false,
  },
  {
    actionType: 'FORCE_PASSWORD_RESET',
    title: 'Forzar cambio de contraseña',
    description: 'Requiere verificación de identidad por acción de seguridad.',
    risk: 'high',
    sensitive: true,
  },
  {
    actionType: 'REVOKE_ALL_SESSIONS',
    title: 'Revocar sesiones activas',
    description: 'Cierra sesiones abiertas ante sospecha de compromiso.',
    risk: 'high',
    sensitive: true,
  },
  {
    actionType: 'CHANGE_ROLE',
    title: 'Reasignar rol',
    description: 'Cambia permisos del usuario con aprobación explícita.',
    risk: 'high',
    sensitive: true,
  },
  {
    actionType: 'SUSPEND_LICENSE',
    title: 'Suspender licencia',
    description: 'Detiene acceso por estado comercial o cumplimiento.',
    risk: 'medium',
    sensitive: false,
  },
  {
    actionType: 'EXTEND_LICENSE',
    title: 'Extender licencia',
    description: 'Amplía vigencia para soporte o decisión comercial.',
    risk: 'low',
    sensitive: false,
  },
];

export const AdminUsersScreen: React.FC = () => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const usersQuery = useAdminUsersQuery();
  const createAdminUserMutation = useCreateAdminUserMutation();
  const updateUserBasicMutation = useAdminUpdateUserBasicMutation();
  const userControlActionMutation = useAdminUserControlActionMutation();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterState>('all');
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();

  const detailQuery = useAdminUserDetailQuery(selectedUserId);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [addUserError, setAddUserError] = useState<string | undefined>();
  const [addUserSuccess, setAddUserSuccess] = useState<string | undefined>();

  const [modalState, setModalState] = useState<{
    visible: boolean;
    actionType: AdminUserControlActionType | null;
    title: string;
    message: string;
  }>({
    visible: false,
    actionType: null,
    title: '',
    message: '',
  });

  const selectedUser = detailQuery.data;

  const users = useMemo(() => {
    const base = (usersQuery.data ?? []).filter((user) => {
      const text = `${user.name} ${user.email}`.toLowerCase();
      const matchesSearch = text.includes(search.trim().toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'active') return !!user.isActive && !user.isBanned;
      if (filter === 'blocked') return !!user.isBanned || !!user.blockedUntil;
      return true;
    });

    return base;
  }, [usersQuery.data, search, filter]);

  const selectUser = (user: User) => {
    setSelectedUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditIsActive(Boolean(user.isActive));
  };

  const handleUpdateBasic = async () => {
    if (!selectedUserId) return;

    try {
      await updateUserBasicMutation.mutateAsync({
        userId: selectedUserId,
        name: editName.trim(),
        email: editEmail.trim(),
        isActive: editIsActive,
      });
      Alert.alert('Actualizado', 'Datos base del usuario actualizados correctamente');
    } catch (error: unknown) {
      Alert.alert('Error', getApiErrorMessage(error, 'No se pudo actualizar el usuario'));
    }
  };

  const executeAction = async (actionType: AdminUserControlActionType, reason: string) => {
    if (!selectedUserId) return;

    try {
      await userControlActionMutation.mutateAsync({
        userId: selectedUserId,
        request: {
          actionType,
          reason,
          payload:
            actionType === 'CHANGE_ROLE'
              ? { newRole: selectedUser?.role === 'ADMIN' ? 'USER' : ('ADMIN' as UserRole) }
              : actionType === 'EXTEND_LICENSE'
              ? { extendDays: 30, licenseId: selectedUser?.license?.id }
              : actionType === 'SUSPEND_LICENSE'
              ? { licenseId: selectedUser?.license?.id }
              : undefined,
        },
      });
      Alert.alert('Acción aplicada', 'El control operativo se ejecutó correctamente');
    } catch (error: unknown) {
      Alert.alert('Error', getApiErrorMessage(error, 'No se pudo ejecutar la acción'));
    }
  };

  const onActionPress = (action: (typeof actionDefinitions)[number]) => {
    if (!selectedUserId) {
      Alert.alert('Selecciona usuario', 'Debes seleccionar un usuario antes de aplicar acciones');
      return;
    }

    if (action.sensitive) {
      setModalState({
        visible: true,
        actionType: action.actionType,
        title: action.title,
        message: 'Acción sensible: confirma y registra un motivo para trazabilidad.',
      });
      return;
    }

    void executeAction(action.actionType, 'Acción operativa aplicada desde consola admin');
  };

  const handleCreateUser = async (input: AdminCreateUserRequest) => {
    try {
      const created = await createAdminUserMutation.mutateAsync(input);
      setAddUserError(undefined);
      setAddUserSuccess('Usuario creado correctamente. Cerrando formulario...');
      setSelectedUserId(created.id);
      setEditName(created.name);
      setEditEmail(created.email);
      setEditIsActive(Boolean(created.isActive));

      setTimeout(() => {
        setIsAddUserModalVisible(false);
        setAddUserSuccess(undefined);
      }, 200);

      Alert.alert('Usuario creado', 'El usuario se creó correctamente desde la zona CRUD');
    } catch (error: unknown) {
      setAddUserSuccess(undefined);
      setAddUserError(getApiErrorMessage(error, 'No se pudo crear el usuario'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeIn duration={180}>
          <View style={styles.header}>
            <Text style={styles.title}>Gestión de Usuarios</Text>
            <Text style={styles.subtitle}>
              Consola operativa segura: CRUD separado de controles críticos (analítica profunda en Reportes)
            </Text>
          </View>
        </FadeIn>

        <FadeInDown delay={40} duration={180}>
          <View style={styles.filtersCard}>
            <Text style={styles.zoneTitle}>Zona A · Búsqueda y segmentación</Text>
            <Input
              testID="admin-users-search-input"
              label="Buscar usuario"
              placeholder="Nombre o email"
              value={search}
              onChangeText={setSearch}
            />

            <View style={styles.filterRow}>
              <FilterPill label="Todos" active={filter === 'all'} onPress={() => setFilter('all')} />
              <FilterPill label="Activos" active={filter === 'active'} onPress={() => setFilter('active')} />
              <FilterPill label="Bloqueados" active={filter === 'blocked'} onPress={() => setFilter('blocked')} />
            </View>
          </View>
        </FadeInDown>

        <FadeInDown delay={80} duration={180}>
          <View style={styles.listCard}>
            <Text style={styles.zoneTitle}>Zona B · Lista de usuarios</Text>
            <Text style={styles.sectionHint}>Entrada CRUD explícita separada de controles operativos sensibles.</Text>
            {users.map((user) => {
              const selected = user.id === selectedUserId;
              return (
                <TouchableOpacity
                  key={user.id}
                  testID={`admin-user-row-${user.id}`}
                  accessibilityRole="button"
                  onPress={() => selectUser(user)}
                  style={[styles.userRow, selected && styles.userRowSelected]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                  <Text style={styles.userBadge}>{user.role}</Text>
                </TouchableOpacity>
              );
            })}
            {!users.length && <Text style={styles.empty}>No hay usuarios para los filtros actuales</Text>}
          </View>
        </FadeInDown>

        {selectedUserId && (
          <SlideInRightAnim duration={180}>
            <View style={styles.detailCard}>
              <Text style={styles.zoneTitle}>Zona C · Detalle consolidado</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bloque CRUD (datos base)</Text>
                <Input label="Nombre" value={editName} onChangeText={setEditName} testID="admin-user-edit-name" />
                <Input
                  label="Email"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  testID="admin-user-edit-email"
                  autoCapitalize="none"
                  containerStyle={{ marginTop: spacing.sm }}
                />
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Cuenta activa</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Cambiar estado activo"
                    testID="admin-user-toggle-active"
                    style={[styles.toggleButton, editIsActive ? styles.toggleOn : styles.toggleOff]}
                    onPress={() => setEditIsActive((prev) => !prev)}
                  >
                    <Text style={styles.toggleText}>{editIsActive ? 'ACTIVA' : 'INACTIVA'}</Text>
                  </TouchableOpacity>
                </View>
                <Button
                  title={updateUserBasicMutation.isPending ? 'Guardando...' : 'Guardar datos base'}
                  onPress={handleUpdateBasic}
                  loading={updateUserBasicMutation.isPending}
                  style={styles.saveButton}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Controles operativos (no-CRUD)</Text>
                <Text style={styles.sectionHint}>
                  Acciones críticas requieren confirmación + motivo para trazabilidad.
                </Text>
                {actionDefinitions.map((action) => (
                  <UserControlActionCard
                    key={action.actionType}
                    actionType={action.actionType}
                    title={action.title}
                    description={action.description}
                    risk={action.risk}
                    onPress={() => onActionPress(action)}
                    testID={`admin-user-action-${action.actionType}`}
                  />
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contexto operativo</Text>
                {detailQuery.isLoading && <Text style={styles.sectionHint}>Cargando detalle...</Text>}
                {!!selectedUser && (
                  <>
                    <Text style={styles.contextText}>Rol: {selectedUser.role}</Text>
                    <Text style={styles.contextText}>Bloqueado hasta: {selectedUser.blockedUntil ?? 'No'}</Text>
                    <Text style={styles.contextText}>Intentos fallidos: {selectedUser.failedLoginAttempts}</Text>
                    <Text style={styles.contextText}>
                      Licencia: {selectedUser.license ? `${selectedUser.license.state} · vence ${new Date(selectedUser.license.expiresAt).toLocaleDateString()}` : 'Sin licencia'}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </SlideInRightAnim>
        )}
      </ScrollView>

      <View style={styles.bottomCrudCta} testID="admin-add-user-bottom-cta">
        <Button
          title="Add user"
          onPress={() => {
            setAddUserError(undefined);
            setAddUserSuccess(undefined);
            setIsAddUserModalVisible(true);
          }}
          style={styles.bottomCrudCtaButton}
        />
      </View>

      <UserActionConfirmModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        confirmLabel={userControlActionMutation.isPending ? 'Aplicando...' : 'Confirmar y aplicar'}
        loading={userControlActionMutation.isPending}
        onCancel={() =>
          setModalState({
            visible: false,
            actionType: null,
            title: '',
            message: '',
          })
        }
        onConfirm={(reason) => {
          const actionType = modalState.actionType;
          if (!actionType) return;
          void executeAction(actionType, reason).finally(() => {
            setModalState({ visible: false, actionType: null, title: '', message: '' });
          });
        }}
      />

      <AddUserFormModal
        visible={isAddUserModalVisible}
        loading={createAdminUserMutation.isPending}
        errorMessage={addUserError}
        onCancel={() => {
          setIsAddUserModalVisible(false);
          setAddUserError(undefined);
          setAddUserSuccess(undefined);
        }}
        onSubmit={handleCreateUser}
        successMessage={addUserSuccess}
      />
    </SafeAreaView>
  );
};

const FilterPill: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => {
  const colors = useColors();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={{
        minHeight: 44,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: active ? colors.primary[500] : colors.border,
        backgroundColor: active ? `${colors.primary[500]}16` : colors.card,
      }}
    >
      <Text style={{ color: active ? colors.primary[500] : colors.text.secondary, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>, shadows: ReturnType<typeof useShadows>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    header: { marginBottom: spacing.md },
    title: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
    subtitle: { color: colors.text.secondary, marginTop: 4 },
    filtersCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
      marginBottom: spacing.md,
    },
    zoneTitle: { color: colors.text.primary, fontWeight: '700', marginBottom: spacing.sm },
    filterRow: { marginTop: spacing.sm, flexDirection: 'row', gap: spacing.sm },
    listCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
      marginBottom: spacing.md,
    },
    bottomCrudCta: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    bottomCrudCtaButton: {
      minHeight: 48,
    },
    userRow: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    userRowSelected: {
      borderColor: colors.primary[500],
      backgroundColor: `${colors.primary[500]}14`,
    },
    userName: { color: colors.text.primary, fontWeight: '700' },
    userEmail: { color: colors.text.secondary, marginTop: 2 },
    userBadge: { color: colors.primary[500], fontWeight: '700' },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
      marginBottom: spacing.lg,
    },
    section: { marginTop: spacing.sm, marginBottom: spacing.md },
    sectionTitle: { color: colors.text.primary, fontWeight: '700', marginBottom: spacing.sm },
    sectionHint: { color: colors.text.secondary, marginBottom: spacing.sm },
    toggleRow: {
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggleLabel: { color: colors.text.secondary, fontWeight: '600' },
    toggleButton: {
      minHeight: 44,
      minWidth: 96,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
    },
    toggleOn: {
      backgroundColor: `${colors.success}20`,
      borderColor: colors.success,
    },
    toggleOff: {
      backgroundColor: `${colors.warning}20`,
      borderColor: colors.warning,
    },
    toggleText: {
      color: colors.text.primary,
      fontWeight: '700',
      fontSize: 12,
    },
    saveButton: { minHeight: 44 },
    contextText: { color: colors.text.secondary, marginBottom: 4 },
    empty: { color: colors.text.secondary },
  });
