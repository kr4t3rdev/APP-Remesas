import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { profileRepository } from "../infrastructure/profile.repository";

export const useProfileBankAccountsQuery = () =>
  useQuery({
    queryKey: queryKeys.profile.bankAccounts(),
    queryFn: profileRepository.getBankAccounts,
    staleTime: 1000 * 60 * 2,
  });

export const useProfileActiveObjectivesQuery = () =>
  useQuery({
    queryKey: queryKeys.profile.activeObjectives(),
    queryFn: profileRepository.getActiveObjectives,
    staleTime: 1000 * 60 * 2,
  });

export const useProfileCashBalancesQuery = () =>
  useQuery({
    queryKey: queryKeys.profile.cashBalances(),
    queryFn: profileRepository.getCashBalances,
    staleTime: 1000 * 60 * 2,
  });

export const useProfileDailyReportQuery = () =>
  useQuery({
    queryKey: queryKeys.profile.dailyReport(),
    queryFn: profileRepository.getDailyReport,
    staleTime: 1000 * 60 * 2,
  });
