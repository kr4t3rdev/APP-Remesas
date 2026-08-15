import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useIsDark } from "../../store/themeStore";

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export const ActionTile: React.FC<Props> = ({ label, icon, onPress }) => {
  const colors = useColors();
  const isDark = useIsDark();

  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: isDark ? "#1e293b" : "#fff" }]}
      onPress={onPress}
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isDark ? "#334155" : "#f3f4f6" },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isDark ? "#e2e8f0" : "#374151"}
        />
      </View>
      <Text style={[styles.label, { color: isDark ? "#e2e8f0" : "#374151" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
});
