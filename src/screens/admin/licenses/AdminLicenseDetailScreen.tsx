import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import { useColors, useIsDark } from "../../../store/themeStore";
import { BREAKPOINTS } from "../../../hooks/useResponsive";

type LoadState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error"; message: string }
  | { kind: "ready"; detail: LicenseDetail };

export const AdminLicenseDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { licenseId } = route.params;

  const colors = useColors();
  const isDark = useIsDark();
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= BREAKPOINTS.tablet;

  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    loadDetails();
  }, [licenseId]);

  const loadDetails = async () => {
    setState({ kind: "loading" });
    try {
      const data = await licensesApi.fetchLicenseDetails(licenseId);
      if (!data) {
        setState({ kind: "not-found" });
      } else {
        setState({ kind: "ready", detail: data });
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Error al cargar la licencia";
      setState({ kind: "error", message });
    }
  };

  if (state.kind === "loading") {
    return (
      <SafeAreaView
        style={[styles.loadingContainer, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </SafeAreaView>
    );
  }

  if (state.kind === "not-found") {
    return (
      <SafeAreaView
        style={[styles.loadingContainer, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.text.secondary}
        />
        <Text style={[styles.emptyText, { color: colors.text.primary }]}>
          Licencia no encontrada
        </Text>
        <Text style={[styles.emptySub, { color: colors.text.secondary }]}>
          La licencia puede haber sido eliminada o el ID es inválido.
        </Text>
      </SafeAreaView>
    );
  }

  if (state.kind === "error") {
    return (
      <SafeAreaView
        style={[styles.loadingContainer, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
        <Text style={[styles.emptyText, { color: colors.text.primary }]}>
          No se pudo cargar la licencia
        </Text>
        <Text style={[styles.emptySub, { color: colors.text.secondary }]}>
          {state.message}
        </Text>
        <TouchableOpacity
          onPress={loadDetails}
          style={[styles.retryButton, { backgroundColor: colors.primary[500] }]}
          accessibilityRole="button"
          accessibilityLabel="Reintentar carga"
        >
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const detail = state.detail;

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
        contentContainerStyle={[styles.content, isWebDesktop && styles.webContent]}
      >
        <LicenseSummaryCard license={detail} />

        <View style={styles.usersList}>
          {detail.fullUserList.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No hay usuarios asignados a esta licencia.
            </Text>
          ) : (
            detail.fullUserList.map((user) => (
              <LicenseUserRow
                key={user.id}
                user={user}
                onPress={() => {
                  navigation.navigate("AdminUserDetail", { userId: user.id });
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
  usersList: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9999,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
