module.exports = {
	preset: "jest-expo",
	transformIgnorePatterns: [
		"node_modules/(?!(react-native|@react-native|@expo|expo|jest-expo|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|@react-native-async-storage|@react-native-community)/)",
	],
	setupFilesAfterSetup: [],
	testMatch: [
		"**/__tests__/**/*.test.[jt]s?(x)",
		"**/?(*.)+(spec|test).[jt]s?(x)",
	],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
