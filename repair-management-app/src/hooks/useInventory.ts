import {
  createWaitlistRequest,
  getParts,
  getWaitlistByPart,
} from "@/api/inventoryApi";
import type {
  CreateWaitlistRequest,
  GetPartsParams,
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
