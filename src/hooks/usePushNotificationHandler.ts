import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getExpoPushToken } from "../services/pushNotifications";
import {
	usePushTokenRegistration,
	useUnregisterPushTokenMutation,
} from "../modules/notifications/application/usePushTokenRegistration";

/**
 * Global hook that orchestrates push notification lifecycle:
 *
 * 1. Registers the Expo push token when the user authenticates.
 * 2. Invalidates TanStack Query caches when a push arrives in foreground.
 * 3. Navigates to the Notifications screen when a push is tapped.
 * 4. Retries token registration when the app returns from background.
 * 5. Removes the registered token when the user logs out (privacy).
 *
 * Mount this once at the app root.
 */
export function usePushNotificationHandler() {
	const { isAuthenticated, checkAuth } = useAuthStore();
	const queryClient = useQueryClient();
	const navigation = useNavigation();
	const { mutate: registerToken } = usePushTokenRegistration();
	const { mutate: unregisterToken } = useUnregisterPushTokenMutation();
	const lastRegisteredTokenRef = useRef<string | null>(null);

	// ── 1. Register push token when user is authenticated ────────────────
	useEffect(() => {
		if (!isAuthenticated) return;

		let cancelled = false;

		(async () => {
			const token = await getExpoPushToken();
			if (!cancelled && token) {
				if (token !== lastRegisteredTokenRef.current) {
					lastRegisteredTokenRef.current = token;
					registerToken(token);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isAuthenticated, registerToken]);

	// ── 5. Remove push token when user logs out ─────────────────────────
	useEffect(() => {
		// Only fire on the true → false transition (when there was a token).
		if (isAuthenticated) return;

		const token = lastRegisteredTokenRef.current;
		if (!token) return;

		// Best-effort cleanup; ignore network errors during logout.
		unregisterToken(token, {
			onSettled: () => {
				lastRegisteredTokenRef.current = null;
			},
		});
	}, [isAuthenticated, unregisterToken]);

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
					// Ensure auth state is synced (handles login during background)
					await checkAuth();
					const token = await getExpoPushToken();
					if (token && token !== lastRegisteredTokenRef.current) {
						lastRegisteredTokenRef.current = token;
						registerToken(token);
					}
				})();
			}
		});

		return () => subscription.remove();
	}, [isAuthenticated, registerToken, checkAuth]);
}
