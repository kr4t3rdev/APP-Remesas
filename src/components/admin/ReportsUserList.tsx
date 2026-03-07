import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInDown, FadeIn } from '../animations';
import { Input } from '../ui/Input';
import { useColors, useShadows } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { User, UserRole } from '../../types';

type ReportsUserListProps = {
  users?: User[];
  loading?: boolean;
  onUserPress?: (user: User) => void;
  selectedUserId?: number;
  delay?: number;
};

export const ReportsUserList: React.FC<ReportsUserListProps> = ({
  users = [],
  loading = false,
  onUserPress,
  selectedUserId,
  delay = 120,
}) => {
  const colors = useColors();
  const shadows = useShadows();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const searchLower = search.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }, [users, search]);

  const getRoleBadgeColor = (role: UserRole) => {
    return role === 'ADMIN' ? colors.primary[500] : colors.success;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={48} color={colors.text.secondary} />
      <Text style={styles.emptyText}>
        {search ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <FadeInDown delay={delay - 20} duration={250}>
      <View style={styles.header}>
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchInput}
        />
        <Text style={styles.countText}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
        </Text>
      </View>
    </FadeInDown>
  );

  if (loading) {
    return (
      <FadeIn>
        <View style={styles.container}>
          <View style={styles.skeleton} />
        </View>
      </FadeIn>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {filteredUsers.length === 0 ? (
        renderEmpty()
      ) : (
        filteredUsers.map((item, index) => (
          <FadeInDown key={item.id} delay={delay + index * 30} duration={250}>
            <TouchableOpacity
              style={[styles.userRow, item.id === selectedUserId && styles.userRowSelected]}
              onPress={() => onUserPress?.(item)}
              accessibilityRole="button"
              accessibilityLabel={`Usuario ${item.name}, ${item.email}`}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {item.email}
                </Text>
              </View>

              <View style={[styles.roleBadge, { backgroundColor: `${getRoleBadgeColor(item.role)}16` }]}>
                <Text style={[styles.roleText, { color: getRoleBadgeColor(item.role) }]}>
                  {item.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                </Text>
              </View>

              <View style={styles.statusIndicator}>
                {item.isActive ? (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                ) : (
                  <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
                )}
              </View>
            </TouchableOpacity>
          </FadeInDown>
        ))
      )}
    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>, shadows: ReturnType<typeof useShadows>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      paddingBottom: spacing.lg,
    },
    header: {
      marginBottom: spacing.md,
    },
    searchInput: {
      marginBottom: spacing.sm,
    },
    countText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm,
    },
    userRowSelected: {
      borderColor: colors.primary[500],
      backgroundColor: `${colors.primary[500]}10`,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    userEmail: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    roleBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    roleText: {
      fontSize: 11,
      fontWeight: '600',
    },
    statusIndicator: {
      marginLeft: spacing.xs,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl * 2,
    },
    emptyText: {
      marginTop: spacing.sm,
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    skeleton: {
      height: 200,
      backgroundColor: colors.border,
      borderRadius: borderRadius.md,
      opacity: 0.3,
    },
  });
