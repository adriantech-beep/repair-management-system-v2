export interface RepairJobPartResponse {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  allocatedAtUtc: string;
}

export interface AllocatePartRequest {
  partId: string;
  quantity: number;
}
