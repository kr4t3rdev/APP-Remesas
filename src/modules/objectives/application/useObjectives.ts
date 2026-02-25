import { useQuery } from '@tanstack/react-query';
import type { ObjectiveStatus } from '../../../types';
import { queryKeys } from '../../../shared/query/queryKeys';
import { objectivesRepository } from '../infrastructure/objectives.repository';

export const useObjectivesQuery = (status?: ObjectiveStatus) =>
  useQuery({
    queryKey: queryKeys.objectives.list(status),
    queryFn: () => objectivesRepository.getObjectives(status),
    staleTime: 1000 * 60 * 2,
  });
