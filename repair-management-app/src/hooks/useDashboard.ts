import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/api/dashboardApi";
import { getBranches } from "@/api/branchApi";

export function useGetDashboardStats(branchId?: string) {
  return useQuery({
    queryKey: ["dashboardStats", branchId],
    queryFn: () => getDashboardStats(branchId),
    refetchInterval: 1000 * 30, // Poll stats every 30 seconds for live updates
  });
}

export function useGetBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });
}
