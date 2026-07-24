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
