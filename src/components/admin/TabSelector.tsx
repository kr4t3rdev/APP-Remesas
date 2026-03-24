import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FadeInDown } from "../animations";
import { useColors } from "../../store/themeStore";
import { borderRadius, spacing } from "../../theme";

export type ReportTab = {
  id: "kpis" | "users" | "blocked" | "audit";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const defaultTabs: ReportTab[] = [
  { id: "kpis", label: "KPIs", icon: "analytics" },
  { id: "users", label: "Usuarios", icon: "people" },
  { id: "blocked", label: "Bloqueados", icon: "lock-closed" },
  { id: "audit", label: "Auditoría", icon: "document-text" },
];

type TabSelectorProps = {
  tabs?: ReportTab[];
  activeTab: ReportTab["id"];
  onTabChange: (tabId: ReportTab["id"]) => void;
  delay?: number;
};

export const TabSelector: React.FC<TabSelectorProps> = ({
  tabs = defaultTabs,
  activeTab,
  onTabChange,
  delay = 40,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <FadeInDown delay={delay} duration={300}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              accessibilityRole="button"
              accessibilityLabel={`Tab ${tab.label}`}
              accessibilityState={{ selected: isActive }}
              onPress={() => onTabChange(tab.id)}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? colors.primary[500] : colors.text.secondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </FadeInDown>
  );
};

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.md,
      paddingVertical: spacing.xs,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 40,
    },
    tabActive: {
      backgroundColor: `${colors.primary[500]}16`,
      borderColor: colors.primary[500],
    },
    tabText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    tabTextActive: {
      color: colors.primary[500],
    },
  });
