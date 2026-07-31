import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePushTokenRegistration } from "./usePushTokenRegistration";

let mockApiPost: jest.Mock;

jest.mock("../../../services/api", () => {
	mockApiPost = jest.fn();
	return { __esModule: true, default: { post: mockApiPost } };
});

function withQueryClient() {
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0 },
			mutations: { retry: false, gcTime: 0 },
		},
	});
	const wrapper = ({ children }: { children: React.ReactNode }) =>
		React.createElement(QueryClientProvider, { client, children });
	return wrapper;
}

describe("usePushTokenRegistration", () => {
	beforeEach(() => {
		mockApiPost.mockReset();
	});

	it("posts the token and platform to /notifications/register-push-token", async () => {
		mockApiPost.mockResolvedValueOnce({ data: { ok: true } });

		const { result } = renderHook(() => usePushTokenRegistration(), {
			wrapper: withQueryClient(),
		});

		await act(async () => {
			result.current.mutate("ExponentPushToken[abc]");
		});

		await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
		expect(mockApiPost).toHaveBeenCalledWith(
			"/notifications/register-push-token",
			expect.objectContaining({
				pushToken: "ExponentPushToken[abc]",
				platform: Platform.OS,
			}),
		);
	});

	it("returns ok from the mutation handle", async () => {
		mockApiPost.mockResolvedValueOnce({ data: { ok: true } });

		const { result } = renderHook(() => usePushTokenRegistration(), {
			wrapper: withQueryClient(),
		});

		await act(async () => {
			result.current.mutate("ExponentPushToken[xyz]");
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
	});

	it("surfaces api errors as mutation errors", async () => {
		mockApiPost.mockRejectedValue(new Error("Boom"));

		const { result } = renderHook(() => usePushTokenRegistration(), {
			wrapper: withQueryClient(),
		});

		await act(async () => {
			result.current.mutate("ExponentPushToken[bad]");
		});

		await waitFor(
			() => {
				expect(result.current.isError).toBe(true);
			},
			{ timeout: 5000 },
		);
	});
});
