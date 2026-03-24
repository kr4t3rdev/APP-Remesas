import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useColors } from "../../../store/themeStore";

export interface TabItem {
  key: string;
  label: string;
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary[500] : colors.card,
                borderColor: isActive ? colors.primary[500] : colors.border,
              },
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? "#fff" : colors.text.secondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
