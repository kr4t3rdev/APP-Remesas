import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ObjectiveStatus,
  CreateObjectiveInput,
  UpdateObjectiveInput,
} from "../../../types";
import { queryKeys } from "../../../shared/query/queryKeys";
import { objectivesRepository } from "../infrastructure/objectives.repository";

export const useObjectivesQuery = (status?: ObjectiveStatus) =>
  useQuery({
    queryKey: queryKeys.objectives.list(status),
    queryFn: () => objectivesRepository.getObjectives(status),
    staleTime: 1000 * 60 * 2,
  });

export const useObjectiveDetailQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.objectives.detail(id),
    queryFn: () => objectivesRepository.getObjectiveById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });

export const useObjectiveProgressQuery = (id: number) =>
  useQuery({
    queryKey: queryKeys.objectives.progress(id),
    queryFn: () => objectivesRepository.getObjectiveProgress(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });

export const useCreateObjectiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateObjectiveInput) =>
      objectivesRepository.createObjective(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.objectives.list(),
      });
    },
  });
};

export const useUpdateObjectiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: number; data: UpdateObjectiveInput }) =>
      objectivesRepository.updateObjective(input.id, input.data),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.objectives.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.objectives.detail(variables.id),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.objectives.progress(variables.id),
        }),
      ]);
    },
  });
};

export const useUpdateObjectiveStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: number; status: ObjectiveStatus }) =>
      objectivesRepository.updateObjectiveStatus(input.id, input.status),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.objectives.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.objectives.detail(variables.id),
        }),
      ]);
    },
  });
};

export const useDeleteObjectiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => objectivesRepository.deleteObjective(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.objectives.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.objectives.detail(id),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.objectives.progress(id),
        }),
      ]);
    },
  });
};
