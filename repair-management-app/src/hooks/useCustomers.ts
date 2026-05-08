import {
  createCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "@/api/customerApi";
import type { UpdateCustomerRequest } from "@/types/customer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });
}

export function useGetCustomerById(customerId: string) {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: Boolean(customerId),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

type UpdateCustomerMutationInput = {
  customerId: string;
  payload: UpdateCustomerRequest;
};

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, payload }: UpdateCustomerMutationInput) =>
      updateCustomer(customerId, payload),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
    },
  });
}
