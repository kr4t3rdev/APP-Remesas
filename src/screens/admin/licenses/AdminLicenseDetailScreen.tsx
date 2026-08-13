import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AdminHeader } from "../../../components/admin/layout/AdminHeader";
import { LicenseSummaryCard } from "../../../components/admin/licenses/LicenseSummaryCard";
import { LicenseUserRow } from "../../../components/admin/licenses/LicenseUserRow";
import { licensesApi } from "../../../api/licensesApi";
import { LicenseDetail } from "../../../types/licenses";
import { useThemeStore, useColors } from "../../../store/themeStore";
import { BREAKPOINTS } from "../../../hooks/useResponsive";

export const AdminLicenseDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { licenseId } = route.params;

  const colorScheme = useColorScheme();
  const setTheme = useThemeStore((state) => state.setTheme);
  const colors = useColors();
  const isDark = colorScheme === "dark";
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= BREAKPOINTS.tablet;

  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme, setTheme]);

  const [detail, setDetail] = useState<LicenseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [licenseId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await licensesApi.fetchLicenseDetails(licenseId);
      setDetail(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: colors.text.primary }}>
          Licencia no encontrada
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <AdminHeader
        title="Usuarios por Licencia"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isWebDesktop && styles.webContent,
        ]}
      >
        <LicenseSummaryCard license={detail} />

        <View style={styles.usersList}>
          {detail.fullUserList.map((user) => (
            <LicenseUserRow key={user.id} user={user} onPress={() => {}} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  webContent: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  actionLink: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  usersList: {
    marginBottom: 20,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
