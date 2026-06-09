import type { DeviceType } from "./device";


export type InvoicePartItem = {
    partName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
};

export type InvoiceData = {
    ticketId: string;
    receivedAt: string;
    completedAt?: string | null;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
    customerAddress?: string | null;
    deviceBrand: string;
    deviceModel: string;
    imeiOrSerialNumber: string | null;
    deviceType: DeviceType;
    problemDescription: string;
    resolutionNotes?: string | null;
    laborCost: number;
    parts: InvoicePartItem[];
    finalCost: number;
    status: string;
    isPaid: boolean;
    branchName: string;
    branchPhone?: string;
    branchAddress?: string;
    companyName?: string;
    website?: string | null;
    businessNumber?: string | null;
    contactNumber?: string | null;
};

export interface InvoiceTemplateProps {
    data: InvoiceData;
}