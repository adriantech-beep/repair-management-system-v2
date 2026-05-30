import {
  allocateRepairJobPart,
  getRepairJobParts,
  removeRepairJobPart,
} from "@/api/repairJobPartsApi";
import type { AllocatePartRequest } from "@/types/repairJobPart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetRepairJobParts(jobId: string) {
  return useQuery({
    queryKey: ["repair-job-parts", jobId],
    queryFn: () => getRepairJobParts(jobId),
    enabled: Boolean(jobId),
  });
}

type AllocatePartVariables = {
  jobId: string;
  payload: AllocatePartRequest;
};

export function useAllocateRepairJobPart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, payload }: AllocatePartVariables) =>
      allocateRepairJobPart(jobId, payload),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["repair-job-parts", jobId] });
      queryClient.invalidateQueries({ queryKey: ["repair-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
}

type RemovePartVariables = {
  jobId: string;
  allocatedPartId: string;
};

export function useRemoveRepairJobPart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, allocatedPartId }: RemovePartVariables) =>
      removeRepairJobPart(jobId, allocatedPartId),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["repair-job-parts", jobId] });
      queryClient.invalidateQueries({ queryKey: ["repair-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
}
