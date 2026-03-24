import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LicenseUserDetail } from "../../../types/licenses";
import { useColors } from "../../../store/themeStore";

interface LicenseUserRowProps {
  user: LicenseUserDetail;
  onPress: () => void;
}

export const LicenseUserRow: React.FC<LicenseUserRowProps> = ({
  user,
  onPress,
}) => {
  const colors = useColors();
  const isDark = colors.background === "#0f172a";

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { borderBottomColor: isDark ? "#334155" : "#f8fafc" },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {/* Placeholder for avatar image */}
        <View
          style={[
            styles.avatarPlaceholder,
            { backgroundColor: isDark ? "#334155" : "#e2e8f0" },
          ]}
        >
          {/* If we had real images, <Image source={{ uri: user.avatarUrl }} /> */}
          {/* Fallback initials */}
          <Text style={[styles.initials, { color: colors.text.secondary }]}>
            {user.name.charAt(0)}
          </Text>
        </View>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: user.status === "online" ? "#22c55e" : "#9ca3af",
              borderColor: isDark ? "#1e293b" : "#fff",
            },
          ]}
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text.primary }]}>
          {user.name}
        </Text>
        <Text style={[styles.email, { color: colors.text.secondary }]}>
          {user.email}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDark ? "#475569" : "#cbd5e1"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e8f0", // Slate 200
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b", // Slate 800
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: "#64748b", // Slate 500
  },
});
