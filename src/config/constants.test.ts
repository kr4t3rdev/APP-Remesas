describe("API base URL selection", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_PHYSICAL_API_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function loadConfig(
    os: "ios" | "android" | "web",
    isDevice: boolean,
    isDev = true,
  ) {
    (globalThis as typeof globalThis & { __DEV__: boolean }).__DEV__ = isDev;
    jest.doMock("react-native", () => ({ Platform: { OS: os } }));
    jest.doMock("expo-device", () => ({ isDevice }));
    return require("./constants").API_CONFIG as { baseURL: string };
  }

  it("uses the configured LAN URL on a physical device", () => {
    process.env.EXPO_PUBLIC_PHYSICAL_API_URL = "http://192.168.0.25:3000/api";
    expect(loadConfig("ios", true).baseURL).toBe(
      "http://192.168.0.25:3000/api",
    );
  });

  it("keeps localhost for the iOS simulator", () => {
    process.env.EXPO_PUBLIC_PHYSICAL_API_URL = "http://192.168.0.25:3000/api";
    expect(loadConfig("ios", false).baseURL).toBe("http://localhost:3000/api");
  });

  it("uses the configured web URL on Android emulator", () => {
    process.env.EXPO_PUBLIC_WEB_API_URL = "http://localhost:4100/api";
    process.env.EXPO_PUBLIC_PHYSICAL_API_URL = "http://192.168.0.25:3000/api";
    expect(loadConfig("android", false).baseURL).toBe(
      "http://localhost:4100/api",
    );
  });

  it("uses the configured LAN URL on a physical Android device", () => {
    process.env.EXPO_PUBLIC_PHYSICAL_API_URL = "http://192.168.0.25:3000/api";
    expect(loadConfig("android", true).baseURL).toBe(
      "http://192.168.0.25:3000/api",
    );
  });

  it("uses the configured web URL during development", () => {
    process.env.EXPO_PUBLIC_WEB_API_URL = "http://localhost:4100/api";
    expect(loadConfig("web", false).baseURL).toBe("http://localhost:4100/api");
  });

  it("uses the production URL outside development", () => {
    process.env.EXPO_PUBLIC_PROD_API_URL = "https://api.example.com/api";
    process.env.EXPO_PUBLIC_PHYSICAL_API_URL = "http://192.168.0.25:3000/api";
    expect(loadConfig("android", true, false).baseURL).toBe(
      "https://api.example.com/api",
    );
  });
});
