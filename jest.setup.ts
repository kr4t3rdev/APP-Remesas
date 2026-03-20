import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  return {
    default: { call: () => {} },
    useSharedValue: jest.fn(),
    useAnimatedStyle: jest.fn(),
    withTiming: jest.fn(),
    withSpring: jest.fn(),
  };
});

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(async () => undefined),
  getItemAsync: jest.fn(async () => null),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement(View, null, children),
    SafeAreaView: ({ children }: any) => React.createElement(View, null, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
