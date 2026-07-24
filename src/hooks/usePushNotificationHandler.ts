import { useEffect } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getExpoPushToken } from "../services/pushNotifications";
import { usePushTokenRegistration } from "../modules/notifications/application/usePushTokenRegistration";

/**
 * Global hook that orchestrates push notification lifecycle:
 *
 * 1. Registers the Expo push token when the user authenticates.
 * 2. Invalidates TanStack Query caches when a push arrives in foreground.
 * 3. Navigates to the Notifications screen when a push is tapped.
 * 4. Retries token registration when the app returns from background.
 *
 * Mount this once at the app root.
 */
export function usePushNotificationHandler() {
	const { isAuthenticated } = useAuthStore();
	const queryClient = useQueryClient();
	const navigation = useNavigation();
	const { mutate: registerToken } = usePushTokenRegistration();

	// ── 1. Register push token when user is authenticated ────────────────
	useEffect(() => {
		if (!isAuthenticated) return;

		let cancelled = false;

		(async () => {
			const token = await getExpoPushToken();
			if (!cancelled && token) {
				registerToken(token);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isAuthenticated, registerToken]);

	// ── 2. Foreground: refresh notification queries ──────────────────────
	useEffect(() => {
		const subscription = Notifications.addNotificationReceivedListener(() => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		});

		return () => subscription.remove();
	}, [queryClient]);

	// ── 3. Tapped: navigate to Notifications screen ──────────────────────
	useEffect(() => {
		const subscription = Notifications.addNotificationResponseReceivedListener(
			() => {
				// Navigate to the Notifications tab; nested navigation is
				// resolved by React Navigation at runtime.
				(navigation as any).navigate("Notifications");
			},
		);

		return () => subscription.remove();
	}, [navigation]);

	// ── 4. Retry registration when app returns from background ───────────
	useEffect(() => {
		if (!isAuthenticated) return;

		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				(async () => {
					const token = await getExpoPushToken();
					if (token) {
						registerToken(token);
					}
				})();
			}
		});

		return () => subscription.remove();
	}, [isAuthenticated, registerToken]);
}
