import { getTenantSettings, updateTenantSettings, uploadTenantLogo } from "@/api/tenantApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useGetTenant() {
  return useQuery({
    queryKey: ["tenantSettings"],
    queryFn: getTenantSettings,
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (companyName: string) => updateTenantSettings(companyName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
    },
  });
}

export function useUploadTenantLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadTenantLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
    },
  });
}