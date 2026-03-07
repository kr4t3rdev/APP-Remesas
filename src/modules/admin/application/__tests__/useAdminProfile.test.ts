import { renderHook, act } from '@testing-library/react-native';
import { useAdminProfile } from '../useAdminProfile';
import { useAuthStore } from '../../../../store/authStore';
import { useThemeStore } from '../../../../store/themeStore';
import { useAdminStatsQuery } from '../useAdminStats';
import { useAdminAuditLogsProfileQuery } from '../useAdminAuditLogsProfile';

jest.mock('../../../../store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../../store/themeStore', () => ({
  useThemeStore: jest.fn(),
  useColors: jest.fn(() => ({
    primary: { 500: '#6366F1', 100: '#E0E7FF' },
    success: '#10B981',
    warning: '#F59E0B',
    secondary: { 500: '#8B5CF6' },
    text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF' },
    background: '#FFFFFF',
    card: '#F9FAFB',
    border: '#E5E7EB',
  })),
  useShadows: jest.fn(() => ({})),
  useIsDark: jest.fn(() => false),
}));

jest.mock('../useAdminStats', () => ({
  useAdminStatsQuery: jest.fn(),
}));

jest.mock('../useAdminAuditLogsProfile', () => ({
  useAdminAuditLogsProfileQuery: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

const mockUseAuthStore = useAuthStore as jest.Mock;
const mockUseThemeStore = useThemeStore as jest.Mock;
const mockUseAdminStatsQuery = useAdminStatsQuery as jest.Mock;
const mockUseAdminAuditLogsProfileQuery = useAdminAuditLogsProfileQuery as jest.Mock;

const mockUser = { id: 1, email: 'admin@test.com', name: 'Admin Test', role: 'ADMIN' as const };

describe('useAdminProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthStore.mockImplementation((selector) => {
      if (selector) return selector({ user: mockUser, logout: jest.fn(), changePassword: jest.fn().mockResolvedValue(undefined) });
      return { user: mockUser, logout: jest.fn(), changePassword: jest.fn().mockResolvedValue(undefined) };
    });

    mockUseThemeStore.mockReturnValue({
      toggleTheme: jest.fn(),
    });

    mockUseAdminStatsQuery.mockReturnValue({
      data: {
        totalUsers: 100,
        activeUsers: 85,
        blockedUsers: 5,
        expiringLicenses: 3,
        dailyRevenue: 1500.50,
        activeLicenses: 80,
      },
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    });

    mockUseAdminAuditLogsProfileQuery.mockReturnValue({
      data: [
        { id: 1, action: 'USER_CREATED', targetUser: 'John', adminName: 'Admin', createdAt: new Date().toISOString() },
      ],
      isRefetching: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('returns user data correctly', () => {
    const { result } = renderHook(() => useAdminProfile());

    expect(result.current.user?.id).toBe(1);
    expect(result.current.user?.email).toBe('admin@test.com');
    expect(result.current.user?.name).toBe('Admin Test');
    expect(result.current.user?.role).toBe('ADMIN');
    expect(result.current.isAdmin).toBe(true);
  });

  it('returns stats data correctly', () => {
    const { result } = renderHook(() => useAdminProfile());

    expect(result.current.stats).toEqual({
      totalUsers: 100,
      activeUsers: 85,
      blockedUsers: 5,
      expiringLicenses: 3,
      dailyRevenue: 1500.50,
      activeLicenses: 80,
    });
  });

  it('returns audit logs correctly', () => {
    const { result } = renderHook(() => useAdminProfile());

    expect(result.current.recentAuditLogs).toHaveLength(1);
    expect(result.current.recentAuditLogs[0].action).toBe('USER_CREATED');
  });

  it('formats numbers correctly', () => {
    const { result } = renderHook(() => useAdminProfile());

    expect(result.current.formatNumber(1500.50)).toBe('1,500.50');
    expect(result.current.formatNumber(1000)).toBe('1,000.00');
  });

  it('returns correct loading states', () => {
    mockUseAdminStatsQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isRefetching: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useAdminProfile());

    expect(result.current.isLoading).toBe(true);
  });

  it('returns refreshing state correctly', () => {
    mockUseAdminStatsQuery.mockReturnValueOnce({
      data: { totalUsers: 100, activeUsers: 85, blockedUsers: 5, expiringLicenses: 3, dailyRevenue: 1500.50, activeLicenses: 80 },
      isLoading: false,
      isRefetching: true,
      refetch: jest.fn(),
    });

    mockUseAdminAuditLogsProfileQuery.mockReturnValueOnce({
      data: [],
      isRefetching: true,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useAdminProfile());

    expect(result.current.isRefreshing).toBe(true);
  });

  it('menu items have correct structure', () => {
    const { result } = renderHook(() => useAdminProfile());

    expect(result.current.menuItems).toBeDefined();
    expect(result.current.menuItems.length).toBeGreaterThan(0);
    
    const themeItem = result.current.menuItems.find(item => item.id === 'theme');
    expect(themeItem).toBeDefined();
    expect(themeItem?.onPress).toBeDefined();
  });
});
