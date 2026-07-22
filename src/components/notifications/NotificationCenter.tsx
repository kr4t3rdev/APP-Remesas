import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { QueryClientContext } from "@tanstack/react-query";
import { useColors } from "../../store/themeStore";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
} from "../../modules/notifications/application/useNotifications";
import type { UserNotification } from "../../types";

const iconForNotification = (type: UserNotification["type"]): keyof typeof Ionicons.glyphMap => {
  if (type === "USER_BANNED" || type === "USER_TEMP_BLOCKED") return "warning-outline";
  if (type === "PASSWORD_RESET" || type === "EMAIL_VERIFICATION") return "lock-closed-outline";
  return "notifications-outline";
};

const ConnectedNotificationCenter: React.FC = () => {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const notificationsQuery = useNotificationsQuery(1, 20, visible);
  const unreadCountQuery = useUnreadNotificationsCountQuery();
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();
  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = unreadCountQuery.data ?? 0;

  const renderNotification = ({ item }: { item: UserNotification }) => {
    const isUnread = !item.readAt;

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${item.title}. ${isUnread ? "No leída" : "Leída"}`}
        onPress={() => isUnread && markAsReadMutation.mutate(item.id)}
        style={[
          styles.item,
          { borderBottomColor: colors.border },
          isUnread && { backgroundColor: colors.primary[50] },
        ]}
      >
        <Ionicons name={iconForNotification(item.type)} size={21} color={colors.primary[500]} />
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: colors.text.primary }]}>{item.title}</Text>
          <Text style={[styles.itemMessage, { color: colors.text.secondary }]}>{item.message}</Text>
          <Text style={[styles.itemDate, { color: colors.text.tertiary }]}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        {isUnread ? <View style={[styles.unreadDot, { backgroundColor: colors.danger }]} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} pendientes` : ""}`}
        onPress={() => setVisible(true)}
        style={styles.trigger}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
        {unreadCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.card }]}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <Modal visible={visible} animationType="fade" transparent onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={[styles.panel, { backgroundColor: colors.card }]} onPress={(event) => event.stopPropagation()}>
            <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.panelTitle, { color: colors.text.primary }]}>Notificaciones</Text>
              <View style={styles.headerActions}>
                {unreadCount > 0 ? (
                  <TouchableOpacity onPress={() => markAllAsReadMutation.mutate()} accessibilityRole="button" accessibilityLabel="Marcar todas como leídas">
                    <Text style={[styles.readAll, { color: colors.primary[500] }]}>Leer todas</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Cerrar notificaciones">
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
            {notificationsQuery.isLoading ? (
              <ActivityIndicator testID="notifications-loading" color={colors.primary[500]} style={styles.loader} />
            ) : notificationsQuery.isError ? (
              <Text accessibilityRole="alert" style={[styles.empty, { color: colors.danger }]}>No se pudieron cargar las notificaciones.</Text>
            ) : notifications.length === 0 ? (
              <Text style={[styles.empty, { color: colors.text.secondary }]}>No tenés notificaciones nuevas.</Text>
            ) : (
              <FlatList data={notifications} keyExtractor={(item) => String(item.id)} renderItem={renderNotification} />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export const NotificationCenter: React.FC = () => {
  const queryClient = useContext(QueryClientContext);
  const colors = useColors();

  if (!queryClient) {
    return (
      <View style={styles.trigger} testID="notifications-unavailable">
        <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
      </View>
    );
  }

  return <ConnectedNotificationCenter />;
};

const styles = StyleSheet.create({
  trigger: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", position: "relative" },
  badge: { position: "absolute", top: 2, right: 0, minWidth: 17, height: 17, paddingHorizontal: 3, borderRadius: 9, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 70, paddingHorizontal: 16 },
  panel: { width: 360, maxWidth: "100%", maxHeight: "75%", borderRadius: 14, overflow: "hidden", elevation: 8 },
  panelHeader: { minHeight: 58, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1 },
  panelTitle: { fontSize: 18, fontWeight: "700" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  readAll: { fontSize: 12, fontWeight: "600" },
  item: { minHeight: 86, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 10, borderBottomWidth: 1 },
  itemContent: { flex: 1, gap: 3 },
  itemTitle: { fontSize: 14, fontWeight: "700" },
  itemMessage: { fontSize: 13, lineHeight: 18 },
  itemDate: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  loader: { padding: 30 },
  empty: { padding: 28, textAlign: "center", fontSize: 14 },
});
