import {
  createRepairJob,
  getRepairJobById,
  getRepairJobs,
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
