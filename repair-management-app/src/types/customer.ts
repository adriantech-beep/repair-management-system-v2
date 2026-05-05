export type CustomerListItem = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  branchId: string;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type CreateCustomerRequest = {
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  branchId: string;
};
