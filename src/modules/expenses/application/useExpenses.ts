import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/query/queryKeys';
import { expensesRepository } from '../infrastructure/expenses.repository';

export const useExpensesQuery = () =>
  useQuery({
    queryKey: queryKeys.expenses.list(),
    queryFn: () => expensesRepository.getExpenses(),
    staleTime: 1000 * 60 * 2,
  });
