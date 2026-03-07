/**
 * Admin Stats Query Hook
 * Custom hook for fetching admin profile statistics
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/query/queryKeys';
import { adminProfileRepository } from '../infrastructure/admin-profile.repository';

export const useAdminStatsQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.profileStats(),
    queryFn: () => adminProfileRepository.getStats(),
    staleTime: 1000 * 60, // 1 minute
  });
