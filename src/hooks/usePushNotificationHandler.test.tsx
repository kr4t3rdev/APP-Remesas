import React from "react";
import { Text } from "react-native";
import { act, render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

let mockCapturedInvalidations: Array<readonly unknown[]> = [];
const mockNavigate = jest.fn();

let mockForegroundHandler: (() => void) | null = null;
const mockForegroundSubscription = { remove: jest.fn() };
const mockResponseSubscription = { remove: jest.fn() };

let mockGetExpoPushToken: jest.Mock;
let mockRegisterToken: jest.Mock;
let mockIsAuthenticated = false;

let mockAppStateHandler: ((state: string) => void) | null = null;
const mockAppStateSubscription = { remove: jest.fn() };

jest.mock("expo-notifications", () => ({
	__esModule: true,
	setNotificationHandler: jest.fn(),
	setNotificationChannelAsync: jest.fn(),
	getPermissionsAsync: jest.fn(),
	requestPermissionsAsync: jest.fn(),
	getExpoPushTokenAsync: jest.fn(),
	setBadgeCountAsync: jest.fn(),
	addNotificationReceivedListener: jest.fn((mockCb: () => void) => {
		mockForegroundHandler = mockCb;
		return mockForegroundSubscription;
	}),
	addNotificationResponseReceivedListener: jest.fn(() =>
		mockResponseSubscription,
	),
}));

jest.mock("@react-navigation/native", () => ({
	useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("react-native", () => {
	const mockFakeAddEventListener = jest.fn(
		(_event: string, mockHandler: (state: string) => void) => {
			mockAppStateHandler = mockHandler;
			return mockAppStateSubscription;
		},
	);
	return {
		AppState: {
			addEventListener: mockFakeAddEventListener,
		},
		Text: ({ children }: any) => children,
	};
});

jest.mock("../services/pushNotifications", () => ({
	__esModule: true,
	getExpoPushToken: () => mockGetExpoPushToken(),
}));

jest.mock(
	"../modules/notifications/application/usePushTokenRegistration",
	() => ({
		usePushTokenRegistration: () => ({
			mutate: (token: string) => mockRegisterToken(token),
		}),
	}),
);

jest.mock("../store/authStore", () => ({
	useAuthStore: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

import { usePushNotificationHandler } from "./usePushNotificationHandler";

function Harness() {
	usePushNotificationHandler();
	return React.createElement(Text, null, "ok");
}

function withQueryClient(): React.ComponentType<{ children: React.ReactNode }> {
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: Infinity },
			mutations: { retry: false },
		},
		logger: {
			log: () => undefined,
			warn: () => undefined,
			error: () => undefined,
		},
	});
	const mockOriginalInvalidate = client.invalidateQueries.bind(client);
	client.invalidateQueries = jest.fn(async (mockFilters?: any) => {
		if (mockFilters?.queryKey) {
			mockCapturedInvalidations.push(mockFilters.queryKey);
		}
		return mockOriginalInvalidate(mockFilters);
	});

	return ({ children }: { children: React.ReactNode }) =>
		React.createElement(
			QueryClientProvider,
			{ client },
			React.createElement(Harness),
			React.createElement(React.Fragment, null, children),
		);
}

describe("usePushNotificationHandler", () => {
	beforeEach(() => {
		mockCapturedInvalidations = [];
		mockNavigate.mockReset();
		mockForegroundHandler = null;
		mockForegroundSubscription.remove.mockReset();
		mockResponseSubscription.remove.mockReset();
		mockAppStateSubscription.remove.mockReset();
		mockAppStateHandler = null;
		mockGetExpoPushToken = jest.fn(async () => null);
		mockRegisterToken = jest.fn();
		mockIsAuthenticated = false;
	});

	it("does not register a token when unauthenticated", async () => {
		mockIsAuthenticated = false;
		render(<Harness />, { wrapper: withQueryClient() });

		await act(async () => {
			await Promise.resolve();
		});

		expect(mockGetExpoPushToken).not.toHaveBeenCalled();
		expect(mockRegisterToken).not.toHaveBeenCalled();
	});

	it("registers the token when authenticated", async () => {
		mockIsAuthenticated = true;
		mockGetExpoPushToken.mockResolvedValue("ExponentPushToken[abc]");

		render(<Harness />, { wrapper: withQueryClient() });

		await waitFor(() =>
			expect(mockRegisterToken).toHaveBeenCalledWith("ExponentPushToken[abc]"),
		);
	});

	it("ignores a denied permission (token stays null)", async () => {
		mockIsAuthenticated = true;
		mockGetExpoPushToken.mockResolvedValue(null);

		render(<Harness />, { wrapper: withQueryClient() });

		await act(async () => {
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(mockRegisterToken).not.toHaveBeenCalled();
	});

	it("invalidates notification queries when a push arrives in foreground", async () => {
		mockIsAuthenticated = false;
		render(<Harness />, { wrapper: withQueryClient() });

		expect(mockForegroundHandler).not.toBeNull();
		await act(async () => {
			mockForegroundHandler!();
		});

		const scopes = mockCapturedInvalidations.map((k) => k[0]);
		expect(scopes.length).toBeGreaterThan(0);
		expect(scopes.every((s) => s === "notifications")).toBe(true);
	});

	it("removes the foreground subscription on unmount", async () => {
		const { unmount } = render(<Harness />, { wrapper: withQueryClient() });
		unmount();
		expect(mockForegroundSubscription.remove).toHaveBeenCalled();
	});

	it("does not register on AppState change before authentication", async () => {
		mockIsAuthenticated = false;
		render(<Harness />, { wrapper: withQueryClient() });

		await act(async () => {
			mockAppStateHandler?.("active");
			await Promise.resolve();
		});

		expect(mockGetExpoPushToken).not.toHaveBeenCalled();
	});

	it("re-registers when AppState goes active after auth", async () => {
		mockIsAuthenticated = true;
		mockGetExpoPushToken.mockResolvedValue("ExponentPushToken[xyz]");

		render(<Harness />, { wrapper: withQueryClient() });

		await waitFor(() =>
			expect(mockRegisterToken).toHaveBeenCalledWith("ExponentPushToken[xyz]"),
		);

		mockRegisterToken.mockClear();
		mockGetExpoPushToken.mockResolvedValue("ExponentPushToken[xyz-2]");

		await act(async () => {
			mockAppStateHandler?.("active");
			await Promise.resolve();
		});

		await waitFor(() =>
			expect(mockRegisterToken).toHaveBeenCalledWith(
				"ExponentPushToken[xyz-2]",
			),
		);
	});

	it("removes the AppState subscription on unmount when authenticated", async () => {
		mockIsAuthenticated = true;
		mockGetExpoPushToken.mockResolvedValue("ExponentPushToken[abc]");

		const { unmount: unmountFn } = render(<Harness />, {
			wrapper: withQueryClient(),
		});

		await waitFor(() => expect(mockAppStateHandler).not.toBeNull());
		unmountFn();
		expect(mockAppStateSubscription.remove).toHaveBeenCalled();
	});
});
