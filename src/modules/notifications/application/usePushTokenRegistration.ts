import { useMutation } from "@tanstack/react-query";
import { Platform } from "react-native";
import api from "../../../services/api";

type RegisterPushTokenDto = {
	pushToken: string;
	platform: "android" | "ios";
};

/**
 * Registers the device push token with the backend.
 * Retries up to 2 times on failure.
 */
export function usePushTokenRegistration() {
	return useMutation({
		mutationFn: (pushToken: string) =>
			api.post<RegisterPushTokenDto>("/notifications/register-push-token", {
				pushToken,
				platform: Platform.OS as "android" | "ios",
			}),
		retry: 2,
	});
}

/**
 * Removes the device push token from the backend.
 * Idempotent; safe to call on logout even if no token was registered.
 */
export function useUnregisterPushTokenMutation() {
	return useMutation({
		mutationFn: (pushToken: string) =>
			api.delete("/notifications/push-token", {
				data: { pushToken },
			}),
	});
}
