import { useNavigation } from "@react-navigation/native";
import type { UserNotification, User } from "../../../types";
import { useAuthStore } from "../../../store/authStore";
import { useMarkNotificationAsReadMutation } from "./useNotifications";

/**
 * Determines the target screen and params for a given notification type.
 * Returns null when no navigation is applicable (e.g. PASSWORD_RESET
 * without a userId in payload).
 */
export function useNotificationNavigation() {
	const navigation = useNavigation();
	const { user } = useAuthStore();
	const { mutate: markAsRead } = useMarkNotificationAsReadMutation();

	return (notification: UserNotification) => {
		// Always mark as read first
		if (!notification.readAt) {
			markAsRead(notification.id);
		}

		const payload = notification.payload ?? {};

		switch (notification.type) {
			case "NEW_USER_REGISTERED":
			case "USER_TEMP_BLOCKED":
			case "USER_BANNED": {
				if (user?.role !== "ADMIN") return; // only admins can access AdminUserDetail
				const targetUser = payload.user as User | undefined;
				const userId =
					(payload.userId as number | undefined) ?? notification.userId;
				if (!targetUser && !userId) return;

				(navigation as any).navigate("AdminUserDetail", {
					user: targetUser ?? { id: userId },
				});
				break;
			}

			case "LICENSE_EXPIRING": {
				if (user?.role !== "ADMIN") return;
				const licenseId = payload.licenseId as string | number | undefined;
				if (!licenseId) return;

				(navigation as any).navigate("AdminLicenseDetail", { licenseId });
				break;
			}

			case "PASSWORD_RESET":
			case "EMAIL_VERIFICATION": {
				// Navigate to AdminUserDetail only when payload.userId exists
				if (user?.role !== "ADMIN") return;
				const targetUser = payload.user as User | undefined;
				const userId = payload.userId as number | undefined;
				if (!targetUser && !userId) return;

				(navigation as any).navigate("AdminUserDetail", {
					user: targetUser ?? { id: userId },
				});
				break;
			}

			default:
				break;
		}
	};
}
