import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, getUsers, type CreateUserRequest } from "@/api/authApi";

export function useGetUsers(role?: string) {
  return useQuery({
    queryKey: ["users", role ?? "all"],
    queryFn: () => getUsers(role),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
