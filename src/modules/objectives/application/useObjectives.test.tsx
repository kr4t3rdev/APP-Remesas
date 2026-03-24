import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import {
  useObjectiveDetailQuery,
  useObjectiveProgressQuery,
  useCreateObjectiveMutation,
  useUpdateObjectiveMutation,
  useUpdateObjectiveStatusMutation,
  useDeleteObjectiveMutation,
} from "./useObjectives";
import { objectivesRepository } from "../infrastructure/objectives.repository";
import { queryKeys } from "../../../shared/query/queryKeys";

jest.mock("../infrastructure/objectives.repository", () => ({
  objectivesRepository: {
    getObjectives: jest.fn(),
    getObjectiveById: jest.fn(),
    getObjectiveProgress: jest.fn(),
    createObjective: jest.fn(),
    updateObjective: jest.fn(),
    updateObjectiveStatus: jest.fn(),
    deleteObjective: jest.fn(),
  },
}));

const mockedRepository = objectivesRepository as jest.Mocked<
  typeof objectivesRepository
>;

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useObjectives hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads objective detail by id", async () => {
    mockedRepository.getObjectiveById.mockResolvedValueOnce({ id: 4 } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useObjectiveDetailQuery(4), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getObjectiveById).toHaveBeenCalledWith(4);
    expect(result.current.data).toEqual({ id: 4 });
  });

  it("loads objective progress by id", async () => {
    mockedRepository.getObjectiveProgress.mockResolvedValueOnce({
      objectiveId: 4,
      percentage: 60,
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useObjectiveProgressQuery(4), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRepository.getObjectiveProgress).toHaveBeenCalledWith(4);
    expect(result.current.data).toEqual({ objectiveId: 4, percentage: 60 });
  });

  it("invalidates objectives list after create", async () => {
    mockedRepository.createObjective.mockResolvedValueOnce({ id: 3 } as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateObjectiveMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({
      name: "Nuevo objetivo",
      targetAmount: 500,
      currencyId: 1,
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.objectives.list(),
      });
    });
  });

  it("invalidates detail and list queries after update", async () => {
    mockedRepository.updateObjective.mockResolvedValueOnce({ id: 10 } as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateObjectiveMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({ id: 10, data: { targetAmount: 3000 } });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.objectives.list(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.objectives.detail(10),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.objectives.progress(10),
      });
    });
  });

  it("invalidates detail and list queries after status change", async () => {
    mockedRepository.updateObjectiveStatus.mockResolvedValueOnce({
      id: 5,
      status: "COMPLETADO",
    } as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateObjectiveStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({ id: 5, status: "COMPLETADO" });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.objectives.list(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.objectives.detail(5),
      });
    });
  });

  it("invalidates detail and list queries after delete", async () => {
    mockedRepository.deleteObjective.mockResolvedValueOnce(undefined as never);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteObjectiveMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync(12);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.objectives.list(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.objectives.detail(12),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.objectives.progress(12),
      });
    });
  });
});
