import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAdminUsersQuery, useCreateAdminUserMutation } from "../../modules/admin/application/useAdminMetrics";
import type { AdminCreateUserRequest } from "../../types";
import { useColors } from "../../store/themeStore";
import { webMetrics, webType } from "../../web/design/webTokens";

type Filter = "all" | "active" | "admin";

export const AdminUsersScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const usersQuery = useAdminUsersQuery();
  const createUserMutation = typeof useCreateAdminUserMutation === "function"
    ? useCreateAdminUserMutation()
    : { isPending: false, mutateAsync: async () => undefined };
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [formError, setFormError] = useState("");
  const [newUser, setNewUser] = useState<AdminCreateUserRequest>({ name: "", email: "", role: "USER", profile: { lastName: "" }, contact: { phone: "" }, access: { isActive: true } });
  const submitNewUser = async () => {
    const name = newUser.name.trim();
    const email = newUser.email.trim().toLowerCase();
    if (!name) return setFormError("Name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFormError("Enter a valid email.");
    setFormError("");
    try {
      await createUserMutation.mutateAsync({ ...newUser, name, email, profile: { lastName: newUser.profile?.lastName?.trim() || undefined }, contact: { phone: newUser.contact?.phone?.trim() || undefined } });
      setShowAddUser(false);
      setNewUser({ name: "", email: "", role: "USER", profile: { lastName: "" }, contact: { phone: "" }, access: { isActive: true } });
    } catch {
      setFormError("Could not create the user. Try again.");
    }
  };
  const users = usersQuery.data ?? [];

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((user) => user.isActive && !user.isBanned).length,
    admins: users.filter((user) => user.role === "ADMIN").length,
    blocked: users.filter((user) => user.isBanned || !user.isActive).length,
  }), [users]);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const haystack = `${user.name} ${user.email}`.toLowerCase();
    if (!haystack.includes(search.trim().toLowerCase())) return false;
    if (filter === "active") return user.isActive && !user.isBanned;
    if (filter === "admin") return user.role === "ADMIN";
    return true;
  }), [filter, search, users]);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.headingRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary[500] }]}>DIRECTORIO / ACCESO</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>Directorio de usuarios</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Busca, revisa y abre el detalle operativo de cada cuenta.</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Actualizar directorio" onPress={() => void usersQuery.refetch()} style={({ pressed }) => [styles.refresh, { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.72 : 1 }]}>
          <Ionicons name="refresh-outline" size={18} color={colors.text.primary} />
          <Text style={[styles.refreshText, { color: colors.text.primary }]}>Actualizar</Text>
        </Pressable>
      </View>

      <View style={styles.statGrid}>
        <Stat label="Usuarios" value={stats.total} colors={colors} icon="people-outline" />
        <Stat label="Activos" value={stats.active} colors={colors} icon="checkmark-circle-outline" tone="success" />
        <Stat label="Administradores" value={stats.admins} colors={colors} icon="shield-checkmark-outline" />
        <Stat label="Bloqueados" value={stats.blocked} colors={colors} icon="lock-closed-outline" tone="warning" />
      </View>

      <View style={[styles.directory, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.toolbar}>
          <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Ionicons name="search-outline" size={18} color={colors.text.tertiary} />
            <TextInput value={search} onChangeText={setSearch} placeholder="Buscar por nombre o correo" placeholderTextColor={colors.text.tertiary} style={[styles.searchInput, { color: colors.text.primary }]} accessibilityLabel="Buscar usuarios" />
          </View>
          <View style={styles.filters}>
            {(["all", "active", "admin"] as const).map((value) => {
              const label = value === "all" ? "Todos" : value === "active" ? "Activos" : "Admins";
              const selected = filter === value;
              return <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setFilter(value)} style={[styles.filter, { borderColor: selected ? colors.primary[500] : colors.border, backgroundColor: selected ? `${colors.primary[500]}14` : colors.card }]}><Text style={[styles.filterText, { color: selected ? colors.primary[500] : colors.text.secondary }]}>{label}</Text></Pressable>;
            })}
          </View>
        </View>

        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerCell, styles.identityCell, { color: colors.text.tertiary }]}>USUARIO</Text>
          <Text style={[styles.headerCell, styles.roleCell, { color: colors.text.tertiary }]}>ROL</Text>
          <Text style={[styles.headerCell, styles.statusCell, { color: colors.text.tertiary }]}>ESTADO</Text>
          <Text style={[styles.headerCell, styles.actionCell, { color: colors.text.tertiary }]}>ABRIR</Text>
        </View>
        {usersQuery.isLoading ? <Text style={[styles.empty, { color: colors.text.secondary }]}>Cargando usuarios…</Text> : usersQuery.isError ? <Text style={[styles.empty, { color: colors.danger }]}>No se pudo cargar el directorio.</Text> : filteredUsers.length === 0 ? <Text style={[styles.empty, { color: colors.text.secondary }]}>No encontramos usuarios con esos filtros.</Text> : filteredUsers.map((user) => {
          const active = user.isActive && !user.isBanned;
          const statusColor = user.isBanned ? colors.danger : active ? colors.success : colors.text.tertiary;
          return <Pressable key={user.id} testID={`admin-user-row-${user.id}`} accessibilityRole="button" onPress={() => navigation.navigate("AdminUserDetail", { user })} style={({ pressed }) => [styles.tableRow, { borderBottomColor: colors.border, backgroundColor: pressed ? `${colors.primary[500]}08` : colors.card }]}>
            <View style={styles.identityCell}>
              <View style={[styles.avatar, { backgroundColor: `${colors.primary[500]}16` }]}><Text style={[styles.avatarText, { color: colors.primary[500] }]}>{user.name.slice(0, 1).toUpperCase()}</Text></View>
              <View style={styles.identityCopy}><Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>{user.name}</Text><Text style={[styles.email, { color: colors.text.secondary }]} numberOfLines={1}>{user.email}</Text></View>
            </View>
            <View style={styles.roleCell}><Text style={[styles.badge, { color: user.role === "ADMIN" ? colors.primary[500] : colors.text.secondary, backgroundColor: user.role === "ADMIN" ? `${colors.primary[500]}14` : `${colors.text.tertiary}14` }]}>{user.role}</Text></View>
            <View style={styles.statusCell}><View style={[styles.statusPill, { borderColor: statusColor }]}><View style={[styles.statusDot, { backgroundColor: statusColor }]} /><Text style={[styles.statusText, { color: statusColor }]}>{user.isBanned ? "BLOQUEADO" : active ? "ACTIVO" : "INACTIVO"}</Text></View></View>
            <View style={styles.actionCell}><Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} /></View>
          </Pressable>;
        })}
      </View>
      <Pressable testID="admin-add-user-bottom-cta" accessibilityRole="button" accessibilityLabel="Add user" onPress={() => setShowAddUser(true)} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary[500], opacity: pressed ? 0.72 : 1 }]}><Ionicons name="person-add-outline" size={16} color={colors.text.inverse} /><Text style={styles.addButtonText}>Add user</Text></Pressable>
      <Modal visible={showAddUser} transparent animationType="fade" onRequestClose={() => setShowAddUser(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.modalHeader}><View><Text style={[styles.modalEyebrow, { color: colors.primary[500] }]}>DIRECTORIO / ALTA</Text><Text style={[styles.modalTitle, { color: colors.text.primary }]}>Add user</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close add user" onPress={() => setShowAddUser(false)} style={styles.closeButton}><Ionicons name="close" size={20} color={colors.text.secondary} /></Pressable></View><TextInput testID="add-user-name-input" placeholder="Name" placeholderTextColor={colors.text.tertiary} value={newUser.name} onChangeText={(name) => setNewUser((current) => ({ ...current, name }))} style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]} /><TextInput testID="add-user-email-input" placeholder="Email" placeholderTextColor={colors.text.tertiary} keyboardType="email-address" autoCapitalize="none" value={newUser.email} onChangeText={(email) => setNewUser((current) => ({ ...current, email }))} style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]} /><TextInput testID="add-user-last-name-input" placeholder="Last name" placeholderTextColor={colors.text.tertiary} value={newUser.profile?.lastName ?? ""} onChangeText={(lastName) => setNewUser((current) => ({ ...current, profile: { ...current.profile, lastName } }))} style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]} /><TextInput testID="add-user-phone-input" placeholder="Phone" placeholderTextColor={colors.text.tertiary} value={newUser.contact?.phone ?? ""} onChangeText={(phone) => setNewUser((current) => ({ ...current, contact: { ...current.contact, phone } }))} style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]} />{formError ? <Text style={[styles.formError, { color: colors.danger }]} accessibilityRole="alert">{formError}</Text> : null}<View style={styles.modalActions}><Pressable accessibilityRole="button" onPress={() => setShowAddUser(false)} style={[styles.cancelButton, { borderColor: colors.border }]}><Text style={[styles.cancelText, { color: colors.text.secondary }]}>Cancel</Text></Pressable><Pressable testID="add-user-submit-button" accessibilityRole="button" disabled={createUserMutation.isPending} onPress={submitNewUser} style={[styles.submitButton, { backgroundColor: colors.primary[500], opacity: createUserMutation.isPending ? 0.6 : 1 }]}><Text style={styles.submitText}>{createUserMutation.isPending ? "Saving…" : "Create user"}</Text></Pressable></View></View></View></Modal>
    </ScrollView>
  );
};

type Palette = ReturnType<typeof useColors>;
const Stat: React.FC<{ label: string; value: number; colors: Palette; icon: keyof typeof Ionicons.glyphMap; tone?: "success" | "warning" }> = ({ label, value, colors, icon, tone }) => {
  const color = tone === "success" ? colors.success : tone === "warning" ? colors.warning : colors.primary[500];
  return <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.statIcon, { backgroundColor: `${color}16` }]}><Ionicons name={icon} size={17} color={color} /></View><Text style={[styles.statLabel, { color: colors.text.tertiary }]}>{label}</Text><Text style={[styles.statValue, { color: colors.text.primary }]}>{value}</Text></View>;
};

const styles = StyleSheet.create({
  scroll: { flex: 1 }, content: { width: "100%", maxWidth: webMetrics.contentMaxWidth, alignSelf: "center", padding: 32, paddingBottom: 56, gap: 24 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }, eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8 }, title: { fontSize: webType.titleSize, lineHeight: 36, fontWeight: "800", letterSpacing: -0.5 }, subtitle: { fontSize: webType.bodySize, lineHeight: 22, marginTop: 5 }, refresh: { minHeight: webMetrics.controlHeight, paddingHorizontal: 16, borderWidth: 1, borderRadius: webMetrics.fieldRadius, flexDirection: "row", alignItems: "center", gap: 8 }, refreshText: { fontSize: webType.bodySize, fontWeight: "700" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 }, statCard: { flexGrow: 1, flexBasis: 190, minHeight: 112, padding: 16, borderWidth: 1, borderRadius: webMetrics.panelRadius }, statIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center", marginBottom: 12 }, statLabel: { fontSize: 11, textTransform: "uppercase", fontWeight: "800", letterSpacing: 0.7 }, statValue: { fontSize: 28, lineHeight: 34, fontWeight: "800", marginTop: 4 },
  directory: { borderWidth: 1, borderRadius: webMetrics.panelRadius, padding: 20 }, addButton: { alignSelf: "flex-start", minHeight: webMetrics.controlHeight, paddingHorizontal: 16, borderRadius: webMetrics.fieldRadius, flexDirection: "row", alignItems: "center", gap: 8 }, addButtonText: { color: "#fff", fontSize: 13, fontWeight: "800" }, toolbar: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18 }, searchBox: { minHeight: webMetrics.controlHeight, flex: 1, minWidth: 240, maxWidth: 520, borderWidth: 1, borderRadius: webMetrics.fieldRadius, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12 }, searchInput: { flex: 1, fontSize: webType.bodySize, height: webMetrics.controlHeight, outlineStyle: "none" as never }, filters: { flexDirection: "row", gap: 8 }, filter: { minHeight: webMetrics.controlHeight, paddingHorizontal: 14, borderRadius: webMetrics.fieldRadius, borderWidth: 1, justifyContent: "center" }, filterText: { fontSize: 13, fontWeight: "800" }, tableHeader: { flexDirection: "row", minHeight: 36, alignItems: "center", borderBottomWidth: 1, paddingHorizontal: 12 }, headerCell: { fontSize: 10, fontWeight: "800", letterSpacing: 1 }, tableRow: { minHeight: 72, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 14 }, identityCell: { flex: 1, minWidth: 220, flexDirection: "row", alignItems: "center", gap: 12 }, roleCell: { width: 110 }, statusCell: { width: 150 }, actionCell: { width: 44, alignItems: "flex-end" }, avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" }, avatarText: { fontSize: 15, fontWeight: "800" }, identityCopy: { flex: 1 }, name: { fontSize: 14, fontWeight: "800" }, email: { fontSize: 12, marginTop: 3 }, badge: { alignSelf: "flex-start", fontSize: 10, fontWeight: "800", letterSpacing: 0.5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 }, statusPill: { alignSelf: "flex-start", minHeight: 28, paddingHorizontal: 9, borderWidth: 1, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 6 }, statusDot: { width: 6, height: 6, borderRadius: 3 }, statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 }, modalBackdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.44)", alignItems: "center", justifyContent: "center", padding: 24 }, modalCard: { width: "100%", maxWidth: 520, borderWidth: 1, borderRadius: webMetrics.panelRadius, padding: 24, gap: 12 }, modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }, modalEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.1 }, modalTitle: { fontSize: 22, fontWeight: "800", marginTop: 4 }, closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" }, modalInput: { minHeight: webMetrics.controlHeight, borderWidth: 1, borderRadius: webMetrics.fieldRadius, paddingHorizontal: 12, fontSize: 14, outlineStyle: "none" as never }, formError: { fontSize: 12, fontWeight: "700" }, modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 6 }, cancelButton: { minHeight: webMetrics.controlHeight, paddingHorizontal: 16, borderWidth: 1, borderRadius: webMetrics.fieldRadius, justifyContent: "center" }, cancelText: { fontSize: 13, fontWeight: "700" }, submitButton: { minHeight: webMetrics.controlHeight, paddingHorizontal: 16, borderRadius: webMetrics.fieldRadius, justifyContent: "center" }, submitText: { color: "#fff", fontSize: 13, fontWeight: "800" }, empty: { textAlign: "center", paddingVertical: 42, fontSize: webType.bodySize },
});
