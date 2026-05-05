import { createCustomer, getCustomers } from "@/api/customerApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
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
