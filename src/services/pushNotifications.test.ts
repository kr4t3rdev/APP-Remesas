import { getExpoPushToken } from "./pushNotifications";

type MockedExpoNotifications = {
	getPermissionsAsync: jest.Mock;
	requestPermissionsAsync: jest.Mock;
	getExpoPushTokenAsync: jest.Mock;
};

let mocked: MockedExpoNotifications;

jest.mock("expo-notifications", () => {
	mocked = {
		getPermissionsAsync: jest.fn(),
		requestPermissionsAsync: jest.fn(),
		getExpoPushTokenAsync: jest.fn(),
	};
	return {
		__esModule: true,
		setNotificationHandler: jest.fn(),
		setNotificationChannelAsync: jest.fn(),
		getPermissionsAsync: mocked.getPermissionsAsync,
		requestPermissionsAsync: mocked.requestPermissionsAsync,
		getExpoPushTokenAsync: mocked.getExpoPushTokenAsync,
		setBadgeCountAsync: jest.fn(),
		addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
		addNotificationResponseReceivedListener: jest.fn(() => ({
			remove: jest.fn(),
		})),
	};
});

describe("getExpoPushToken", () => {
	it("returns the Expo token when permission is granted", async () => {
		mocked.getPermissionsAsync.mockResolvedValueOnce({ status: "granted" });
		mocked.getExpoPushTokenAsync.mockResolvedValueOnce({
			data: "ExponentPushToken[token-1]",
		});

		const token = await getExpoPushToken();

		expect(token).toBe("ExponentPushToken[token-1]");
		expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
	});

	it("prompts for permission when undetermined", async () => {
		mocked.getPermissionsAsync.mockResolvedValueOnce({ status: "undetermined" });
		mocked.requestPermissionsAsync.mockResolvedValueOnce({ status: "granted" });
		mocked.getExpoPushTokenAsync.mockResolvedValueOnce({
			data: "ExponentPushToken[token-2]",
		});

		const token = await getExpoPushToken();

		expect(token).toBe("ExponentPushToken[token-2]");
		expect(mocked.requestPermissionsAsync).toHaveBeenCalledTimes(1);
	});

	it("returns null when permission is denied", async () => {
		mocked.getPermissionsAsync.mockResolvedValueOnce({ status: "undetermined" });
		mocked.requestPermissionsAsync.mockResolvedValueOnce({ status: "denied" });

		const token = await getExpoPushToken();

		expect(token).toBeNull();
		expect(mocked.getExpoPushTokenAsync).not.toHaveBeenCalled();
	});

	it("does not prompt again when permission is already determined", async () => {
		mocked.getPermissionsAsync.mockResolvedValueOnce({ status: "denied" });

		const token = await getExpoPushToken();

		expect(token).toBeNull();
		expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
		expect(mocked.getExpoPushTokenAsync).not.toHaveBeenCalled();
	});

	it("passes the configured Expo projectId when requesting the token", async () => {
		mocked.getPermissionsAsync.mockResolvedValueOnce({ status: "granted" });
		mocked.getExpoPushTokenAsync.mockResolvedValueOnce({
			data: "ExponentPushToken[token-3]",
		});

		await getExpoPushToken();

		expect(mocked.getExpoPushTokenAsync).toHaveBeenCalledWith({
			projectId: expect.stringMatching(/^[0-9a-f-]{36}$/),
		});
	});
});
