import type {
  CreateCustomerRequest,
  CustomerListItem,
  UpdateCustomerRequest,
} from "@/types/customer";
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

export async function getCustomerById(id: string): Promise<CustomerListItem> {
  const response = await apiClient.get<CustomerListItem>(
    `/api/customers/${id}`,
  );
  return response.data;
}

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerRequest,
): Promise<CustomerListItem> {
  const response = await apiClient.put<CustomerListItem>(
    `/api/customers/${id}`,
    payload,
  );
  return response.data;
}
