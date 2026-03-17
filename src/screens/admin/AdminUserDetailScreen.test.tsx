
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AdminUserDetailScreen } from './AdminUserDetailScreen';
import { 
  useAdminUserControlActionMutation, 
  useAdminUpdateUserBasicMutation,
  useAdminUserDetailQuery 
} from '../../modules/admin/application/useAdminUsers';
import { useNavigation, useRoute } from '@react-navigation/native';

// Mocks
jest.mock('../../modules/admin/application/useAdminUsers', () => ({
  useAdminUserControlActionMutation: jest.fn(),
  useAdminUpdateUserBasicMutation: jest.fn(),
  useAdminUserDetailQuery: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('../../store/themeStore', () => ({
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

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const mockRoute = {
  params: {
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
      role: 'USER',
    },
  },
};

describe('AdminUserDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useRoute as jest.Mock).mockReturnValue(mockRoute);
    
    // Default mocks
    (useAdminUserControlActionMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    (useAdminUpdateUserBasicMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it('renders user details correctly from route params when query loads', () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { getByText } = render(<AdminUserDetailScreen />);
    
    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('User')).toBeTruthy();
    expect(getByText('ID: 1')).toBeTruthy();
  });

  it('displays full user details including license info when query succeeds', () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: 'Test User Full',
        email: 'test@example.com',
        isActive: true,
        role: 'USER',
        license: {
          id: 123,
          state: 'ACTIVE',
          expiresAt: '2024-12-31',
          planId: 1,
        }
      },
      isLoading: false,
    });

    const { getByText } = render(<AdminUserDetailScreen />);
    
    expect(getByText('Test User Full')).toBeTruthy();
    expect(getByText('LICENSED')).toBeTruthy();
  });

  it('navigates to license detail when Manage License is pressed and user has license', () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        role: 'USER',
        license: {
          id: 999,
          state: 'ACTIVE',
        }
      },
      isLoading: false,
    });

    const { getByText } = render(<AdminUserDetailScreen />);
    
    fireEvent.press(getByText('Manage License'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminLicenseDetail', { 
      licenseId: 999 
    });
  });

  it('navigates to licenses list when Manage License is pressed and user has NO license', () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        role: 'USER',
        license: null
      },
      isLoading: false,
    });

    const { getByText } = render(<AdminUserDetailScreen />);
    
    fireEvent.press(getByText('Manage License'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminLicensesList');
  });

  it('shows operational actions', () => {
    (useAdminUserDetailQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { getByText } = render(<AdminUserDetailScreen />);
    
    expect(getByText('Temporary Block')).toBeTruthy();
    expect(getByText('Suspend Account')).toBeTruthy();
    expect(getByText('Force Password Reset')).toBeTruthy();
    expect(getByText('Revoke Sessions')).toBeTruthy();
    expect(getByText('Change Role')).toBeTruthy();
  });
});
