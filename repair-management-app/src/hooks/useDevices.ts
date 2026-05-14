import {
  createDevice,
  deleteDevice,
  getDeviceById,
  getDevicesByCustomerId,
  lookupDeviceByIdentifier,
  updateDevice,
} from "@/api/deviceApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDevice,
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ["devices", customerId] });
    },
  });
}

export function useGetDevicesByCustomerId(customerId: string) {
  return useQuery({
    queryKey: ["devices", customerId],
    queryFn: () => getDevicesByCustomerId(customerId),
    enabled: Boolean(customerId),
  });
}

export function useGetDeviceById(deviceId: string) {
  return useQuery({
    queryKey: ["device", deviceId],
    queryFn: () => getDeviceById(deviceId),
    enabled: Boolean(deviceId),
  });
}

type UpdateDeviceVariables = {
  deviceId: string;
  customerId?: string;
  payload: Parameters<typeof updateDevice>[1];
};

export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceId, payload }: UpdateDeviceVariables) =>
      updateDevice(deviceId, payload),
    onSuccess: (updatedDevice, { deviceId, customerId }) => {
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });

      const scopedCustomerId = customerId ?? updatedDevice.customerId;

      queryClient.invalidateQueries({
        queryKey: ["devices", scopedCustomerId],
      });
    },
  });
}

type DeleteDeviceVariables = {
  deviceId: string;
  customerId: string;
};

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceId }: DeleteDeviceVariables) => deleteDevice(deviceId),
    onSuccess: (_, { deviceId, customerId }) => {
      queryClient.invalidateQueries({ queryKey: ["devices", customerId] });
      queryClient.removeQueries({
        queryKey: ["device", deviceId],
        exact: true,
      });
    },
  });
}

export function useLookupDeviceByIdentifier() {
  return useMutation({
    mutationFn: lookupDeviceByIdentifier,
  });
}
