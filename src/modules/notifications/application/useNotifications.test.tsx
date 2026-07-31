import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import {
	useMarkAllNotificationsAsReadMutation,
	useMarkNotificationAsReadMutation,
} from "./useNotifications";

let mockRepository: {
	markAsRead: jest.Mock;
	markAllAsRead: jest.Mock;
};

jest.mock("../infrastructure/notifications.repository", () => {
	mockRepository = {
		markAsRead: jest.fn(async () => undefined),
		markAllAsRead: jest.fn(async () => undefined),
	};
	return { notificationsRepository: mockRepository };
});

type CapturedInvalidations = {
	list: number;
	infinite: number;
	unreadCount: number;
};

function buildWrapper(captured: CapturedInvalidations) {
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0 },
			mutations: { retry: false, gcTime: 0 },
		},
	});
	const original = client.invalidateQueries.bind(client);
	client.invalidateQueries = jest.fn(async (filters: any) => {
		const key: readonly unknown[] = filters?.queryKey ?? [];
		if (key[0] === "notifications") {
			if (key[1] === "list") captured.list++;
			if (key[1] === "infinite") captured.infinite++;
			if (key[1] === "unreadCount") captured.unreadCount++;
		}
		return original(filters);
	}) as typeof client.invalidateQueries;

	const wrapper = ({ children }: { children: React.ReactNode }) =>
		React.createElement(QueryClientProvider, { client, children });
	return { wrapper, client };
}

describe("notification read mutations", () => {
	it("markAsRead invalidates list, infinite, and unreadCount", async () => {
		const captured: CapturedInvalidations = {
			list: 0,
			infinite: 0,
			unreadCount: 0,
		};
		const { wrapper } = buildWrapper(captured);

		const { result } = renderHook(
			() => useMarkNotificationAsReadMutation(),
			{ wrapper },
		);

		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => {
			expect(mockRepository.markAsRead).toHaveBeenCalledWith(1);
		});

		expect(captured.list).toBe(1);
		expect(captured.infinite).toBe(1);
		expect(captured.unreadCount).toBe(1);
	});

	it("markAllAsRead invalidates list, infinite, and unreadCount", async () => {
		const captured: CapturedInvalidations = {
			list: 0,
			infinite: 0,
			unreadCount: 0,
		};
		const { wrapper } = buildWrapper(captured);

		const { result } = renderHook(
			() => useMarkAllNotificationsAsReadMutation(),
			{ wrapper },
		);

		await act(async () => {
			result.current.mutate();
		});

		await waitFor(() => {
			expect(mockRepository.markAllAsRead).toHaveBeenCalled();
		});

		expect(captured.list).toBe(1);
		expect(captured.infinite).toBe(1);
		expect(captured.unreadCount).toBe(1);
	});

	it("centralizes the three notification query keys", () => {
		expect(queryKeys.notifications.list()).toEqual(["notifications", "list"]);
		expect(queryKeys.notifications.infinite()).toEqual([
			"notifications",
			"infinite",
		]);
		expect(queryKeys.notifications.unreadCount()).toEqual([
			"notifications",
			"unreadCount",
		]);
	});
});
