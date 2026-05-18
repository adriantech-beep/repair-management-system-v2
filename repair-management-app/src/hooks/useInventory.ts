import {
  addPartCompatibility,
  createPart,
  createWaitlistRequest,
  getParts,
  getWaitlistByPart,
  removePartCompatibility,
  updatePart,
  updatePartStock,
} from "@/api/inventoryApi";
import type {
  AddCompatibilityRequest,
  CreatePartRequest,
  CreateWaitlistRequest,
  GetPartsParams,
  UpdatePartRequest,
  UpdateStockPartRequest,
  WaitlistStatus,
} from "@/types/inventory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetParts(params?: GetPartsParams) {
  return useQuery({
    queryKey: ["parts", params ?? {}],
    queryFn: () => getParts(params),
  });
}

export function useGetWaitlistByPart(partId: string, status?: WaitlistStatus) {
  return useQuery({
    queryKey: ["part-waitlist", partId, status ?? "all"],
    queryFn: () => getWaitlistByPart(partId, status),
    enabled: Boolean(partId),
  });
}

type CreateWaitlistMutationVariables = {
  partId: string;
  payload: CreateWaitlistRequest;
};

export function useCreateWaitlistRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ partId, payload }: CreateWaitlistMutationVariables) =>
      createWaitlistRequest(partId, payload),
    onSuccess: (_, { partId }) => {
      queryClient.invalidateQueries({ queryKey: ["part-waitlist", partId] });
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePartRequest) => createPart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
}

export function useUpdatePart(partId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePartRequest) => updatePart(partId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
    },
  });
}

export function useUpdatePartStock(partId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStockPartRequest) =>
      updatePartStock(partId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
    },
  });
}

export function useAddPartCompatibility(partId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCompatibilityRequest) =>
      addPartCompatibility(partId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
    },
  });
}

export function useRemovePartCompatibility(partId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (compatibilityId: string) =>
      removePartCompatibility(partId, compatibilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
    },
  });
}
