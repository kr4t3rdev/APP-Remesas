import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useColors } from '../../../store/themeStore';
import { spacing } from '../../../theme';

interface AdminHeaderProps {
  title: string;
  onRefresh?: () => void;
  onBack?: () => void;
  showAvatar?: boolean;
}

function getInitials(name: string | null | undefined, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email && email.length) return email[0].toUpperCase();
  return '?';
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title, 
  onRefresh, 
  onBack,
  showAvatar = true 
}) => {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const initials = useMemo(() => getInitials(user?.name, user?.email), [user?.name, user?.email]);

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    leftContainer: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    rightContainer: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary[500],
    },
    avatarText: {
      color: colors.text.inverse,
      fontWeight: '700',
      fontSize: 16,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
    },
    iconButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.header}>
      {/* Left Side: Back Button or Avatar */}
      <View style={styles.leftContainer}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : showAvatar ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        ) : null}
      </View>

      {/* Center: Title */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Right Side: Refresh Button or Empty */}
      <View style={styles.rightContainer}>
        {onRefresh ? (
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.iconButton}
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
