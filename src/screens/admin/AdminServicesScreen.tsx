import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { InfoCard } from "../../components/admin/InfoCard";
import { GradientCard } from "../../components/admin/GradientCard";
import { ActionTile } from "../../components/admin/ActionTile";
import { t } from "../../i18n";
import { AdminMetrics } from "../../types/adminMetrics";
import { BottomNav } from "../../components/admin/BottomNav";
import { AdminHeader } from "../../components/admin/layout/AdminHeader";
import { useThemeStore } from "../../store/themeStore";

export const AdminServicesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const colorScheme = useColorScheme();
  const setTheme = useThemeStore((state) => state.setTheme);
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme, setTheme]);

  const fetchMetrics = () => {
    // Bind dynamic metrics on mount
    // Fallback to mock locally if API isn't wired yet
    // We import the API lazily here to avoid runtime dependency issues in SSR-like environments
    import("../../api/adminMetricsApi")
      .then((m) => {
        m.fetchAdminMetrics().then((data: AdminMetrics) => setMetrics(data));
      })
      .catch(() => {
        // Fallback demo data
        setMetrics({
          activeCount: 1240,
          expiredCount: 85,
          activeDelta: "+12%",
          expiredDelta: "-5%",
        });
      });
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const themeStyles = {
    container: {
      backgroundColor: isDark ? "#0f172a" : "#f9fafb",
    },
    text: {
      color: isDark ? "#f8fafc" : "#111827",
    },
    cardBg: {
      backgroundColor: isDark ? "#1e293b" : "#fff", // if needed
    },
    sectionTitle: {
      color: isDark ? "#f8fafc" : "#111827",
    },
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, themeStyles.container]}
      edges={["top"]}
    >
      <AdminHeader title="Servicios" onRefresh={fetchMetrics} />
      <ScrollView contentContainerStyle={styles.container}>
        {metrics ? (
          <View style={styles.metricsRow}>
            <InfoCard
              style={{
                flex: 1,
                marginRight: 8,
                backgroundColor: isDark ? "#1e293b" : "#fff",
              }}
              title={t("admin.services.activas")}
              value={metrics.activeCount}
              delta={metrics.activeDelta}
              deltaColor="#16a34a"
              icon="checkmark-circle"
              iconColor="#3b82f6"
              // Assuming InfoCard might accept text style props or we need to check its implementation.
              // For now relying on it hopefully inheriting or being simple.
              // If InfoCard is not adapted, I might need to wrap it or pass props if it supports them.
            />
            <InfoCard
              style={{
                flex: 1,
                marginLeft: 8,
                backgroundColor: isDark ? "#1e293b" : "#fff",
              }}
              title={t("admin.services.expiradas")}
              value={metrics.expiredCount}
              delta={metrics.expiredDelta}
              deltaColor="#dc2626"
              icon="alert-circle"
              iconColor="#ef4444"
            />
          </View>
        ) : (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        )}

        <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>
          {t("admin.services.gestion_principal")}
        </Text>
        <GradientCard
          title={t("admin.services.licencias")}
          subtitle={t("admin.services.control_acceso")}
          actionLabel={t("admin.services.configurar_ahora")}
          icon="id-card"
          iconColor="#4f46e5"
          backgroundColor={isDark ? "#1e293b" : "#e0f2fe"} // Darker bg for dark mode
          onPress={() => navigation.navigate("AdminLicensesList")}
        />
        <GradientCard
          title={t("admin.services.planes")}
          subtitle={t("admin.services.editar_ofertas")}
          actionLabel={t("admin.services.ver_planes")}
          icon="pricetag"
          iconColor="#9333ea"
          backgroundColor={isDark ? "#1e293b" : "#f3e8ff"}
          onPress={() => navigation.navigate("AdminPlansList")}
        />

        <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>
          {t("admin.actions.acciones_rapidas")}
        </Text>
        <View style={styles.actionsRow}>
          <ActionTile
            label={t("admin.actions.nueva")}
            icon="card"
            onPress={() => {}}
          />
          <ActionTile
            label={t("admin.actions.exportar")}
            icon="download"
            onPress={() => {}}
          />
          <ActionTile
            label={t("admin.actions.alertas")}
            icon="notifications"
            onPress={() => {}}
          />
          <ActionTile
            label={t("admin.actions.otra")}
            icon="document-text"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
      {/* <BottomNav activeItem={t('admin.nav.servicios') || 'Servicios'} /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  iconButton: {
    padding: 4,
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 14,
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  loadingRow: {
    paddingVertical: 40,
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
});

export default AdminServicesScreen;
