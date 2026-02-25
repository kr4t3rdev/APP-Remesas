import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn, FadeInDown, ScaleIn } from '../../components/animations';
import { StatsCard, CircularProgress } from '../../components/charts/Charts';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import type { RootStackScreenProps } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import {
  useProfileActiveObjectivesQuery,
  useProfileBankAccountsQuery,
  useProfileCashBalancesQuery,
  useProfileDailyReportQuery,
} from '../../modules/profile/application/useProfile';

type MenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
};

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const changePassword = useAuthStore((state) => state.changePassword);
  const navigation = useNavigation<RootStackScreenProps<'Main'>['navigation']>();

  const bankAccountsQuery = useProfileBankAccountsQuery();
  const objectivesQuery = useProfileActiveObjectivesQuery();
  const cashBalancesQuery = useProfileCashBalancesQuery();
  const dailyReportQuery = useProfileDailyReportQuery();

  const bankAccounts = bankAccountsQuery.data ?? [];
  const objectives = objectivesQuery.data ?? [];
  const cashBalances = cashBalancesQuery.data ?? [];
  const dailyReport = dailyReportQuery.data;
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    await Promise.all([
      bankAccountsQuery.refetch(),
      objectivesQuery.refetch(),
      cashBalancesQuery.refetch(),
      dailyReportQuery.refetch(),
    ]);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Complete todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Éxito', 'Contraseña actualizada');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const formatNumber = (value: number | string) => {
    const num = Number(value) || 0;
    return num.toLocaleString('es-CU', { minimumFractionDigits: 2 });
  };

  const menuItems: MenuItem[] = [
    {
      id: 'password',
      title: 'Cambiar Contraseña',
      subtitle: 'Actualizar credenciales',
      icon: 'lock-closed-outline',
      color: colors.primary[500],
      onPress: () => setShowPasswordForm(!showPasswordForm),
    },
    {
      id: 'rates',
      title: 'Tasas de Cambio',
      subtitle: 'Configurar tasas de referencia',
      icon: 'swap-horizontal-outline',
      color: colors.success,
      onPress: () => navigation.navigate('ExchangeRates'),
    },
    {
      id: 'accounts',
      title: 'Cuentas Bancarias',
      subtitle: `${bankAccounts.length} cuentas`,
      icon: 'business-outline',
      color: colors.warning,
      onPress: () => Alert.alert('Cuentas Bancarias', 'Próximamente'),
    },
    {
      id: 'about',
      title: 'Acerca de',
      subtitle: 'Versión 1.0.0',
      icon: 'information-circle-outline',
      color: colors.text.secondary,
      onPress: () => Alert.alert('Casa de Cambio', 'Versión 1.0.0\nSistema de gestión para casa de cambio'),
    },
  ];

  const activeObjectives = objectives.filter(o => o.status === 'ACTIVO');
  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalCashBalance = cashBalances.reduce((sum, b) => sum + Number(b.balance), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={
              bankAccountsQuery.isRefetching ||
              objectivesQuery.isRefetching ||
              cashBalancesQuery.isRefetching ||
              dailyReportQuery.isRefetching
            } 
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        <FadeIn>
          <View style={styles.header}>
            <Text style={styles.title}>Perfil</Text>
            <Text style={styles.subtitle}>Tu cuenta y configuración</Text>
          </View>
        </FadeIn>

        <FadeInDown delay={50}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={colors.primary[500]} />
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role}</Text>
              </View>
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </FadeInDown>

        <View style={styles.statsGrid}>
          <ScaleIn delay={100}>
            <StatsCard
              title="Total Banco"
              value={`$ ${formatNumber(totalBankBalance)}`}
              icon={<Ionicons name="card" size={20} color={colors.primary[500]} />}
              color={colors.primary[500]}
              style={styles.statCard}
            />
          </ScaleIn>
          <ScaleIn delay={150}>
            <StatsCard
              title="Total Caja"
              value={`$ ${formatNumber(totalCashBalance)}`}
              icon={<Ionicons name="wallet" size={20} color={colors.success} />}
              color={colors.success}
              style={styles.statCard}
            />
          </ScaleIn>
        </View>

        {dailyReport && (
          <FadeInDown delay={200}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen del Día</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="trending-up" size={20} color={colors.success} />
                    <Text style={styles.summaryLabel}>Ganancia</Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      $ {formatNumber(dailyReport.profit.net)}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Ionicons name="swap-horizontal" size={20} color={colors.primary[500]} />
                    <Text style={styles.summaryLabel}>Transacciones</Text>
                    <Text style={styles.summaryValue}>{dailyReport.transactions.total}</Text>
                  </View>
                </View>
              </View>
            </View>
          </FadeInDown>
        )}

        {activeObjectives.length > 0 && (
          <FadeInDown delay={250}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Objetivos Activos</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Ver todo</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.objectivesScroll}
              >
                {activeObjectives.slice(0, 3).map((objective, index) => (
                  <ScaleIn key={objective.id} delay={300 + index * 50}>
                    <View style={styles.objectiveCard}>
                      <CircularProgress
                        percentage={objective.percentage}
                        size={60}
                        strokeWidth={5}
                        color={objective.percentage >= 100 ? colors.success : colors.primary[500]}
                      >
                        <Text style={styles.objectivePercent}>{objective.percentage.toFixed(0)}%</Text>
                      </CircularProgress>
                      <Text style={styles.objectiveName} numberOfLines={1}>{objective.name}</Text>
                      <Text style={styles.objectiveAmount}>
                        {formatNumber(objective.currentAmount)} / {formatNumber(objective.targetAmount)}
                      </Text>
                    </View>
                  </ScaleIn>
                ))}
              </ScrollView>
            </View>
          </FadeInDown>
        )}

        {bankAccounts.length > 0 && (
          <FadeInDown delay={300}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cuentas Bancarias</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Ver todo</Text>
                </TouchableOpacity>
              </View>
              {bankAccounts.slice(0, 2).map((account, index) => (
                <View key={account.id} style={styles.accountCard}>
                  <View style={styles.accountIcon}>
                    <Ionicons name="business" size={20} color={colors.primary[500]} />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountBank}>{account.bankName}</Text>
                  </View>
                  <View style={styles.accountBalance}>
                    <Text style={styles.balanceLabel}>Saldo</Text>
                    <Text style={styles.balanceValue}>$ {formatNumber(account.balance)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </FadeInDown>
        )}

        <FadeInDown delay={350}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            {menuItems.map((item, index) => (
              <ScaleIn key={item.id} delay={400 + index * 50}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </ScaleIn>
            ))}
          </View>
        </FadeInDown>

        {showPasswordForm && (
          <FadeInDown>
            <View style={styles.passwordForm}>
              <Text style={styles.formTitle}>Cambiar Contraseña</Text>
              <Input
                label="Contraseña Actual"
                placeholder="••••••••"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <View style={{ marginTop: spacing.sm }}>
                <Input
                  label="Nueva Contraseña"
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.formButtons}>
                <Button
                  title="Cancelar"
                  variant="outline"
                  onPress={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Guardar"
                  onPress={handleChangePassword}
                  loading={loading}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </FadeInDown>
        )}

        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={{ color: colors.danger }}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },
  objectivesScroll: {
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  objectiveCard: {
    width: 140,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  objectivePercent: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  objectiveName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  objectiveAmount: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  accountBank: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  menuItem: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  passwordForm: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
});
