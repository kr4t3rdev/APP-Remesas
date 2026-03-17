import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { borderRadius, spacing } from '../../theme';
import type { User, UserRole } from '../../types';

// Mock avatar for consistency
const AVATAR_MOCK = 'https://i.pravatar.cc/150';
const { height } = Dimensions.get('window');

type AdminChangeRoleModalProps = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (newRole: UserRole) => void;
  loading?: boolean;
};

// Define available roles with descriptions
const ROLES = [
  {
    id: 'ADMIN',
    label: 'Admin',
    description: 'Full access to all financial records, system settings, and user management.',
  },
  {
    id: 'MANAGER', // Assuming this might be added later, or mapping to a specific permission set
    label: 'Manager',
    description: 'Can approve transactions, manage department reports, and oversee workflows.',
  },
  {
    id: 'EDITOR', // Mapping to USER role but with implied permissions conceptually
    label: 'Editor',
    description: 'Can create and edit entries but cannot approve payments or modify settings.',
  },
  {
    id: 'VIEWER', // Read-only concept
    label: 'Viewer',
    description: 'Read-only access to dashboards, transaction history, and exported reports.',
  },
];

export const AdminChangeRoleModal: React.FC<AdminChangeRoleModalProps> = ({
  visible,
  user,
  onClose,
  onConfirm,
  loading = false,
}) => {
  // Theme
  const colors = useColors();
  const theme = {
    background: colors.background,
    card: colors.card,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    primary: colors.primary[500],
    border: colors.border,
    overlay: 'rgba(15, 23, 42, 0.9)', // Kept dark for overlay contrast
  };

  const [selectedRole, setSelectedRole] = useState<string>(user?.role === 'ADMIN' ? 'ADMIN' : 'EDITOR');

  if (!visible || !user) return null;

  const handleConfirm = () => {
    // Map UI roles back to system roles (USER/ADMIN)
    // For this demo, Manager/Editor/Viewer all map to USER but could have different permissions
    const systemRole: UserRole = selectedRole === 'ADMIN' ? 'ADMIN' : 'USER';
    onConfirm(systemRole);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Change Role</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* User Profile Summary */}
          <View style={styles.profileSection}>
            <Image 
              source={{ uri: `${AVATAR_MOCK}?u=${user.id}` }} 
              style={styles.avatar} 
            />
            <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
            
            <View style={[styles.currentRoleBadge, { backgroundColor: `${theme.primary}20` }]}>
              <Text style={[styles.currentRoleText, { color: theme.primary }]}>
                Current: {user.role === 'ADMIN' ? 'Super Admin' : 'Editor'}
              </Text>
            </View>

            <Text style={[styles.userInfo, { color: theme.textSecondary }]}>
              Finance Department • Global Operations
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            SELECT NEW ROLE
          </Text>

          {/* Role Selection Cards */}
          <View style={styles.rolesContainer}>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <TouchableOpacity
                  key={role.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedRole(role.id)}
                  style={[
                    styles.roleCard,
                    { 
                      backgroundColor: theme.card,
                      borderColor: isSelected ? theme.primary : theme.border 
                    }
                  ]}
                >
                  <View style={styles.roleContent}>
                    <Text style={[styles.roleLabel, { color: theme.text }]}>
                      {role.label}
                    </Text>
                    <Text style={[styles.roleDescription, { color: theme.textSecondary }]}>
                      {role.description}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.radioButton, 
                    { 
                      borderColor: isSelected ? theme.primary : theme.textSecondary,
                      backgroundColor: isSelected ? theme.primary : 'transparent'
                    }
                  ]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Action */}
        <View style={[styles.footer, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.primary }]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? 'Updating...' : 'Update Role'}
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.securityNote, { color: theme.textSecondary }]}>
            SECURITY LEVEL: HIGH
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
    borderWidth: 4,
    borderColor: '#1E293B', 
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  currentRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  currentRoleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  rolesContainer: {
    gap: spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  roleLabel: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
  },
  confirmButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  securityNote: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
});
