import { getTenantSettings, updateTenantSettings, uploadTenantLogo, getPublicTenantSettings } from "@/api/tenantApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useGetTenant() {
  return useQuery({
    queryKey: ["tenantSettings"],
    queryFn: getTenantSettings,
  });
}

export function useGetPublicTenant() {
  return useQuery({
    queryKey: ["publicTenantSettings"],
    queryFn: getPublicTenantSettings,
    retry: false, // Don't retry if subdomain is not registered / default
    staleTime: 1000 * 60 * 10, // Cache public settings for 10 minutes
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