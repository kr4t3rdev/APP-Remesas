import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Configure the foreground notification handler.
 * We handle the UI ourselves (via TanStack Query invalidation),
 * so native alerts are suppressed to avoid duplication.
 */
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: false,
		shouldPlaySound: false,
		shouldSetBadge: true,
		shouldShowBanner: false,
		shouldShowList: false,
	}),
});

/**
 * Create the default Android notification channel.
 * Required for Android 8+; notifications are silent otherwise.
 */
if (Platform.OS === "android") {
	Notifications.setNotificationChannelAsync("default", {
		name: "Notificaciones",
		importance: Notifications.AndroidImportance.HIGH,
		vibrationPattern: [0, 100, 50, 100],
		lightColor: "#0ea5e9",
	});
}

/**
 * Request notification permissions and retrieve the Expo push token.
 *
 * Returns `null` when the user denies permission (silent fallback).
 */
export async function getExpoPushToken(): Promise<string | null> {
	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	// Only prompt if not already determined
	if (existingStatus !== "granted" && existingStatus !== "denied") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	// Denied → silent fallback
	if (finalStatus !== "granted") {
		return null;
	}

	const tokenData = await Notifications.getExpoPushTokenAsync({
		projectId: "b1f45fa9-34eb-4642-aaf4-8dd7303af589",
	});

	return tokenData.data;
}

/**
 * Update the app badge count.
 */
export function setAppBadgeCount(count: number): void {
	Notifications.setBadgeCountAsync(count).catch(() => {
		// Silently ignore – badge is best-effort
	});
}

/**
 * Clear the app badge to zero.
 */
export function clearAppBadge(): void {
	setAppBadgeCount(0);
}
