import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LicenseUserDetail } from "../../../types/licenses";
import type { User } from "../../../types";

type UserType = LicenseUserDetail | User;

interface UserManagementCardProps {
  user: UserType;
  onPress: () => void;
}

const getRoleBadge = (role: string, isDark: boolean) => {
  const normalizedRole = role.toUpperCase();
  switch (normalizedRole) {
    case "ADMINISTRADOR":
    case "ADMIN":
      return {
        text: "ADMINISTRADOR",
        bg: isDark ? "#1e3a8a" : "#dbeafe",
        color: "#3b82f6",
      };
    case "EDITOR":
      return {
        text: "EDITOR",
        bg: isDark ? "#334155" : "#f1f5f9",
        color: isDark ? "#94a3b8" : "#64748b",
      };
    case "VISUALIZADOR":
    case "VIEWER":
      return {
        text: "VISUALIZADOR",
        bg: isDark ? "#334155" : "#f1f5f9",
        color: isDark ? "#94a3b8" : "#64748b",
      };
    case "INACTIVO":
      return {
        text: "INACTIVO",
        bg: isDark ? "#450a0a" : "#fef2f2",
        color: "#ef4444",
      };
    default:
      return {
        text: role.toUpperCase(),
        bg: isDark ? "#334155" : "#f1f5f9",
        color: isDark ? "#94a3b8" : "#64748b",
      };
  }
};

export const UserManagementCard: React.FC<UserManagementCardProps> = ({
  user,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark"; // This works, but we should ensure React Native detects it correctly
  // If the user says it's not detecting light mode, maybe we need to force update or check how the app is wrapped.
  // However, standard useColorScheme is reactive.
  // Let's ensure the fallback colors are actually distinct enough.

  const roleConfig = getRoleBadge(user.role, isDark);

  const styles = getStyles(isDark);

  // Helper to get status color - handle both User and LicenseUserDetail
  const getStatusColor = () => {
    const licenseUser = user as LicenseUserDetail;
    const regularUser = user as User;
    if ("status" in user && licenseUser.status) {
      return licenseUser.status === "online" ? "#22c55e" : "#64748b";
    }
    // For regular User, use isActive property
    if ("isActive" in user) {
      return regularUser.isActive ? "#22c55e" : "#64748b";
    }
    return "#64748b";
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.contentRow}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {/* Fallback to avatar image or initial */}
            <Text style={styles.initials}>{user.name.charAt(0)}</Text>
          </View>
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleConfig.bg }]}>
            <Text style={[styles.roleText, { color: roleConfig.color }]}>
              {roleConfig.text}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={isDark ? "#94a3b8" : "#9ca3af"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark ? "#1e293b" : "#ffffff", // Slate 800 : White
      borderRadius: 30, // Fully rounded pills as per design
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#f1f5f9",
    },
    contentRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatarContainer: {
      position: "relative",
      marginRight: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? "#334155" : "#e2e8f0",
      justifyContent: "center",
      alignItems: "center",
    },
    initials: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#94a3b8" : "#64748b",
    },
    statusDot: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: isDark ? "#1e293b" : "#ffffff",
    },
    infoContainer: {
      flex: 1,
      justifyContent: "center",
    },
    name: {
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#f8fafc" : "#1e293b",
      marginBottom: 2,
    },
    email: {
      fontSize: 13,
      color: isDark ? "#64748b" : "#64748b",
      marginBottom: 8,
    },
    roleBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    roleText: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    menuButton: {
      padding: 8,
      alignSelf: "flex-start",
    },
  });
