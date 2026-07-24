import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "../../store/themeStore";
import { clearAppBadge } from "../../services/pushNotifications";
import { useNotificationNavigation } from "../../modules/notifications/application/useNotificationNavigation";
import {
	useMarkAllNotificationsAsReadMutation,
	useNotificationsQuery,
	useUnreadNotificationsCountQuery,
} from "../../modules/notifications/application/useNotifications";
import { NotificationList } from "../../components/notifications/NotificationCenter";
import type { UserNotification } from "../../types";

/**
 * Full-height notifications screen used as a tab in mobile bottom navigation.
 * Reuses the shared NotificationList component and handles navigation via
 * useNotificationNavigation hook.
 */
export const NotificationsScreen: React.FC = () => {
	const colors = useColors();
	const notificationsQuery = useNotificationsQuery(1, 20, true);
	const { data: unreadCount } = useUnreadNotificationsCountQuery();
	const { mutate: markAllAsRead } = useMarkAllNotificationsAsReadMutation();
	const onPressNotification = useNotificationNavigation();

	// Clear the app badge when the user opens the notifications screen
	useEffect(() => {
		clearAppBadge();
	}, []);

	const notifications = notificationsQuery.data?.data ?? [];

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Header */}
			<View
				style={[
					styles.header,
					{ borderBottomColor: colors.border, backgroundColor: colors.card },
				]}
			>
				<Text style={[styles.title, { color: colors.text.primary }]}>
					Notificaciones
				</Text>
				{(unreadCount ?? 0) > 0 ? (
					<TouchableOpacity
						onPress={() => markAllAsRead()}
						accessibilityRole="button"
						accessibilityLabel="Marcar todas como leídas"
					>
						<Text style={[styles.readAll, { color: colors.primary[500] }]}>
							Leer todas
						</Text>
					</TouchableOpacity>
				) : null}
			</View>

			{/* Notification list */}
			<NotificationList
				notifications={notifications}
				isLoading={notificationsQuery.isLoading}
				isError={notificationsQuery.isError}
				onPressNotification={(item: UserNotification) =>
					onPressNotification(item)
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		minHeight: 58,
		paddingHorizontal: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomWidth: 1,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
	},
	readAll: {
		fontSize: 12,
		fontWeight: "600",
	},
});
