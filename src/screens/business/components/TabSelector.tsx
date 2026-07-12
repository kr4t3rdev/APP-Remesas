import React from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../../store/themeStore";

export interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface TabSelectorProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export const TabSelector = ({
  tabs,
  activeTab,
  onTabChange,
}: TabSelectorProps) => {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onTabChange(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              {
                backgroundColor: isActive
                  ? colors.primary[50]
                  : colors.card,
                borderColor: isActive ? colors.primary[300] : colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isActive
                    ? colors.primary[100]
                    : colors.surface,
                },
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? colors.primary[600] : colors.text.secondary}
              />
            </View>
            <Text
              numberOfLines={2}
              style={[
                styles.label,
                {
                  color: isActive
                    ? colors.primary[700]
                    : colors.text.primary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
  },
  tab: {
    width: "48%",
    minHeight: 56,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 17,
  },
});
