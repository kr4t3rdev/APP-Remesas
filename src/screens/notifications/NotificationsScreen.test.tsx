import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockInfinite = jest.fn();
const mockUnread = jest.fn();
const mockMarkAll = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../../modules/notifications/application/useNotifications", () => ({
	useNotificationsInfiniteQuery: (...args: unknown[]) => mockInfinite(...args),
	useUnreadNotificationsCountQuery: (...args: unknown[]) => mockUnread(...args),
	useMarkAllNotificationsAsReadMutation: () => ({ mutate: mockMarkAll }),
}));
jest.mock("../../modules/notifications/application/useNotificationNavigation", () => ({
	useNotificationNavigation: () => mockNavigate,
}));
jest.mock("../../services/pushNotifications", () => ({ clearAppBadge: jest.fn() }));
jest.mock("../../store/themeStore", () => ({
	useColors: () => ({
		background: "#fff", card: "#fff", border: "#ddd", primary: { 50: "#eef", 500: "#00f" },
		text: { primary: "#111", secondary: "#555", tertiary: "#999" }, danger: "#f00",
	}),
}));
jest.mock("../../components/notifications/NotificationCenter", () => ({
	NotificationList: (props: any) => {
		const { Text: MockText, TouchableOpacity: MockTouchableOpacity } = require("react-native");
		return (
		<>
			<MockText testID="notification-count">{props.notifications.length}</MockText>
			<MockTouchableOpacity testID="end-reached" onPress={props.onEndReached} />
		</>
		);
	},
}));

import { NotificationsScreen } from "./NotificationsScreen";

const notification = (id: number) => ({
	id, type: "SYSTEM", title: `Title ${id}`, message: "Message", readAt: null,
	createdAt: "2026-01-01T00:00:00.000Z",
});

const renderScreen = () => {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
	return render(<QueryClientProvider client={client}><NotificationsScreen /></QueryClientProvider>);
};

describe("NotificationsScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUnread.mockReturnValue({ data: 0 });
		mockMarkAll.mockReset();
	});

	it("concatenates notifications across infinite pages", () => {
		const fetchNextPage = jest.fn();
		mockInfinite.mockReturnValue({
			data: { pages: [{ data: [notification(1)] }, { data: [notification(2), notification(3)] }] },
			isLoading: false, isError: false, fetchNextPage, hasNextPage: false, isFetchingNextPage: false,
		});
		const view = renderScreen();
		expect(view.getByTestId("notification-count").props.children).toBe(3);
	});

	it("fetches the next page only when another page exists and no fetch is active", () => {
		const fetchNextPage = jest.fn();
		mockInfinite.mockReturnValue({ data: { pages: [{ data: [notification(1)] }] }, isLoading: false, isError: false, fetchNextPage, hasNextPage: true, isFetchingNextPage: false });
		const view = renderScreen();
		fireEvent.press(view.getByTestId("end-reached"));
		expect(fetchNextPage).toHaveBeenCalledTimes(1);

		fetchNextPage.mockClear();
		mockInfinite.mockReturnValue({ data: { pages: [{ data: [notification(1)] }] }, isLoading: false, isError: false, fetchNextPage, hasNextPage: true, isFetchingNextPage: true });
		view.rerender(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })}><NotificationsScreen /></QueryClientProvider>);
		fireEvent.press(view.getByTestId("end-reached"));
		expect(fetchNextPage).not.toHaveBeenCalled();
	});

	it("does not fetch when there is no next page", () => {
		const fetchNextPage = jest.fn();
		mockInfinite.mockReturnValue({ data: { pages: [{ data: [notification(1)] }] }, isLoading: false, isError: false, fetchNextPage, hasNextPage: false, isFetchingNextPage: false });
		const view = renderScreen();
		fireEvent.press(view.getByTestId("end-reached"));
		expect(fetchNextPage).not.toHaveBeenCalled();
	});

	it("shows and invokes Leer todas when there are unread notifications", () => {
		mockUnread.mockReturnValue({ data: 2 });
		mockInfinite.mockReturnValue({ data: { pages: [{ data: [notification(1)] }] }, isLoading: false, isError: false, fetchNextPage: jest.fn(), hasNextPage: false, isFetchingNextPage: false });
		const view = renderScreen();
		fireEvent.press(view.getByLabelText("Marcar todas como leídas"));
		expect(mockMarkAll).toHaveBeenCalledTimes(1);
	});
});
