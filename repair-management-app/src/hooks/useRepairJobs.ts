import {
  createRepairJob,
  getRepairJobById,
  getRepairJobs,
  updateRepairJob,
  updateRepairJobStatus,
} from "@/api/repairJobApi";
import type { RepairJobStatus } from "@/types/repairJob";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetRepairJobs(status?: RepairJobStatus) {
  return useQuery({
    queryKey: ["repair-jobs", status ?? "all"],
    queryFn: () => getRepairJobs(status),
  });
}

export function useGetRepairJobById(repairJobId: string) {
  return useQuery({
    queryKey: ["repair-job", repairJobId],
    queryFn: () => getRepairJobById(repairJobId),
    enabled: Boolean(repairJobId),
  });
}

export function useCreateRepairJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepairJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-jobs"] });
    },
  });
}

type UpdateRepairJobVariables = {
  repairJobId: string;
  payload: Parameters<typeof updateRepairJob>[1];
};

export function useUpdateRepairJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repairJobId, payload }: UpdateRepairJobVariables) =>
      updateRepairJob(repairJobId, payload),
    onSuccess: (updatedRepairJob, { repairJobId }) => {
      queryClient.setQueryData(["repair-job", repairJobId], updatedRepairJob);
      queryClient.invalidateQueries({ queryKey: ["repair-jobs"] });
    },
  });
}

type UpdateRepairJobStatusVariables = {
  repairJobId: string;
  payload: Parameters<typeof updateRepairJobStatus>[1];
};

export function useUpdateRepairJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repairJobId, payload }: UpdateRepairJobStatusVariables) =>
      updateRepairJobStatus(repairJobId, payload),
    onSuccess: (updatedRepairJob, { repairJobId }) => {
      queryClient.setQueryData(["repair-job", repairJobId], updatedRepairJob);
      queryClient.invalidateQueries({ queryKey: ["repair-jobs"] });
    },
  });
}
