import { getTenantSettings, updateTenantSettings, uploadTenantLogo, getPublicTenantSettings, deleteTenantLogo } from "@/api/tenantApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useGetTenant() {
  return useQuery({
    queryKey: ["tenantSettings"],
    queryFn: getTenantSettings,
  });
}

export function useGetPublicTenant(enabled = true) {
  return useQuery({
    queryKey: ["publicTenantSettings"],
    queryFn: getPublicTenantSettings,
    retry: false,
    staleTime: 1000 * 60 * 10,
    enabled,
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      companyName: string;
      contactNumber: string | null;
      website: string | null;
      businessNumber: string | null;
    }) => updateTenantSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicTenantSettings"] });
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

export function useDeleteTenantLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTenantLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
    },
  });
}