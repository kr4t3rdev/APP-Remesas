import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { License } from "../../../types/licenses";
import { useColors, useIsDark } from "../../../store/themeStore";

interface LicenseCardProps {
  license: License;
  onPress: () => void;
  onRenew?: () => void;
}

const getStatusColor = (
  status: string,
  colors: ReturnType<typeof useColors>,
) => {
  switch (status) {
    case "active":
      return {
        bg: `${colors.success}18`,
        text: colors.success,
      };
    case "expired":
      return {
        bg: `${colors.text.secondary}18`,
        text: colors.text.secondary,
      };
    case "subscribed":
      return {
        bg: `${colors.info}18`,
        text: colors.info,
      };
    case "pending":
      return {
        bg: `${colors.warning}18`,
        text: colors.warning,
      };
    default:
      return {
        bg: `${colors.text.secondary}18`,
        text: colors.text.secondary,
      };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "ACTIVA";
    case "expired":
      return "EXPIRADA";
    case "subscribed":
      return "SUSCRITO";
    case "pending":
      return "PENDIENTE";
    default:
      return status.toUpperCase();
  }
};

const getIconForPlan = (planName: string, isDark: boolean) => {
  const baseColor = isDark ? "#fff" : "#fff"; // Icon color
  if (planName.includes("Enterprise"))
    return {
      name: "ribbon",
      color: "#3b82f6",
      bg: isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
    };
  if (planName.includes("Standard"))
    return {
      name: "shield-checkmark",
      color: "#f59e0b",
      bg: isDark ? "rgba(245, 158, 11, 0.1)" : "#fef3c7",
    };
  if (planName.includes("API"))
    return {
      name: "code-slash",
      color: "#6366f1",
      bg: isDark ? "rgba(99, 102, 241, 0.1)" : "#e0e7ff",
    };
  return {
    name: "person",
    color: "#64748b",
    bg: isDark ? "#1e293b" : "#f1f5f9",
  };
};

export const LicenseCard: React.FC<LicenseCardProps> = ({
  license,
  onPress,
  onRenew,
}) => {
  const colors = useColors();
  const isDark = useIsDark();

  const statusStyle = getStatusColor(license.status, colors);
  const iconConfig = getIconForPlan(license.planName, isDark);

  // Display up to 2 users, then +N
  const visibleUsers = license.assignedUsers.slice(0, 2);
  const remainingCount = Math.max(0, license.assignedUsers.length - 2);

  const cardStyle = {
    backgroundColor: isDark ? "#1e293b" : "#fff",
    borderColor: isDark ? "#334155" : "#e5e7eb",
  };

  return (
    <TouchableOpacity
      style={[styles.card, cardStyle]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Licencia ${license.planName}, estado ${getStatusLabel(license.status)}`}
    >
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
            <Ionicons
              name={iconConfig.name as any}
              size={20}
              color={iconConfig.color}
            />
          </View>
          <View style={styles.titleColumn}>
            <Text style={[styles.planName, { color: colors.text.primary }]}>
              {license.planName}
            </Text>
            <Text style={[styles.licenseId, { color: colors.text.secondary }]}>
              ID: {license.licenseKey}
            </Text>
          </View>
        </View>

        <View
          style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
          accessibilityLabel={`Estado: ${getStatusLabel(license.status)}`}
        >
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {getStatusLabel(license.status)}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: isDark ? "#334155" : "#f3f4f6" },
        ]}
      />

      <View style={styles.footerRow}>
        <View style={styles.usersRow}>
          {visibleUsers.map((user, idx) => (
            <View
              key={user.id}
              style={[
                styles.avatar,
                {
                  marginLeft: idx > 0 ? -10 : 0,
                  zIndex: 10 - idx,
                  borderColor: isDark ? "#1e293b" : "#fff",
                  backgroundColor: isDark ? "#334155" : "#f3f4f6",
                },
              ]}
            >
              <Ionicons name="person" size={12} color="#6b7280" />
            </View>
          ))}
          {remainingCount > 0 && (
            <View
              style={[
                styles.avatar,
                styles.moreAvatar,
                {
                  marginLeft: -10,
                  zIndex: 0,
                  borderColor: isDark ? "#1e293b" : "#fff",
                  backgroundColor: isDark ? "#334155" : "#f3f4f6",
                },
              ]}
            >
              <Text style={[styles.moreText, { color: colors.text.secondary }]}>
                +{remainingCount}
              </Text>
            </View>
          )}
          {license.assignedUsers.length === 1 && (
            <Text
              style={[styles.singleUserName, { color: colors.text.secondary }]}
            >
              {license.assignedUsers[0].name}
            </Text>
          )}
        </View>

        <View style={styles.actionContainer}>
          {license.status === "expired" ? (
            <TouchableOpacity
              onPress={onRenew}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={`Renovar licencia ${license.planName}`}
            >
              <Text style={styles.renewText}>Renovar</Text>
            </TouchableOpacity>
          ) : license.autoRenew ? (
            <Text style={[styles.footerInfo, { color: colors.text.secondary }]}>
              Renov. auto: On
            </Text>
          ) : license.expiryDate ? (
            <Text style={[styles.footerInfo, { color: colors.text.secondary }]}>
              Vence: {license.expiryDate}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(LicenseCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  leftHeader: {
    flexDirection: "row",
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleColumn: {
    justifyContent: "center",
    flex: 1,
  },
  planName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  licenseId: {
    fontSize: 12,
    color: "#9ca3af",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  usersRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  moreAvatar: {
    backgroundColor: "#e5e7eb",
  },
  moreText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4b5563",
  },
  singleUserName: {
    marginLeft: 8,
    fontSize: 13,
    color: "#4b5563",
  },
  actionContainer: {
    alignItems: "flex-end",
  },
  renewText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 13,
  },
  footerInfo: {
    color: "#9ca3af",
    fontSize: 12,
  },
});
