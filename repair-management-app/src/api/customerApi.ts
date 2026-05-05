import type { CreateCustomerRequest, CustomerListItem } from "@/types/customer";
import apiClient from "./httpClient";

export async function getCustomers(): Promise<CustomerListItem[]> {
  const response = await apiClient.get<CustomerListItem[]>("/api/customers");
  return response.data;
}

export async function createCustomer(
  payload: CreateCustomerRequest,
): Promise<CustomerListItem> {
  const response = await apiClient.post<CustomerListItem>(
    "/api/customers",
    payload,
  );
  return response.data;
}
