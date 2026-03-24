import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/queryKeys";
import { usersRepository } from "../infrastructure/users.repository";

export const useOperationalUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.users.operationalList(),
    queryFn: usersRepository.getOperationalList,
    staleTime: 1000 * 30,
  });
