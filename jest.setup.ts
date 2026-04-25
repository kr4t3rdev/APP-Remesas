import 'react-native-gesture-handler/jestSetup';

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

jest.mock('./src/store/themeStore', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    card: '#F9FAFB',
    text: { primary: '#1F2937', secondary: '#6B7280' },
    primary: { 500: '#3B82F6' },
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#E5E7EB',
  }),
}));
