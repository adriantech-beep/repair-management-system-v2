import React from "react";
import type { DeviceType } from "@/types/device";

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
};

interface InvoiceTemplateProps {
  data: InvoiceData;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    const partsTotal = data.parts.reduce((sum, item) => sum + item.subtotal, 0);
    const calculatedTotal = data.laborCost + partsTotal;

    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-[800px] bg-white p-8 font-sans text-xs text-zinc-900 border border-zinc-200 shadow-sm printable-invoice"
        style={{ boxSizing: "border-box" }}
      >
        {/* Header Section */}
        <header className="flex justify-between items-start border-b-2 border-zinc-950 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-emerald-950">
              PINES MULTI-TELECOM
            </h1>
            <p className="text-zinc-600 font-medium">{data.branchName}</p>
            {data.branchAddress && <p className="text-[10px] text-zinc-500 leading-snug">{data.branchAddress}</p>}
            {data.branchPhone && <p className="text-[10px] text-zinc-500">Tel: {data.branchPhone}</p>}
          </div>
          <div className="text-right space-y-1">
            <div className="inline-block bg-emerald-600 text-white px-3 py-1 text-xs font-bold tracking-wider rounded uppercase">
              Sales Invoice
            </div>
            <h2 className="text-lg font-black tracking-wide text-zinc-950 mt-1">
              INVOICE: {data.ticketId}
            </h2>
            <div className="flex justify-end gap-1.5 mt-1">
              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                data.isPaid 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}>
                {data.isPaid ? "PAID" : "PENDING PAYMENT"}
              </span>
            </div>
            <p className="text-[9px] text-zinc-500 mt-1">
              Date Completed: {data.completedAt ? new Date(data.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}
            </p>
          </div>
        </header>

        {/* Customer & Device Meta Panels */}
        <section className="grid grid-cols-2 gap-8 my-5">
          {/* Bill To Customer */}
          <div className="border border-zinc-200 rounded-lg p-3.5 space-y-1.5 bg-zinc-50/50">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
              Bill To Customer
            </h3>
            <p className="text-sm font-black text-zinc-900 leading-none">{data.customerName}</p>
            <p className="text-zinc-700 leading-tight">Phone: {data.customerPhone}</p>
            {data.customerEmail && <p className="text-zinc-700 leading-tight">Email: {data.customerEmail}</p>}
            {data.customerAddress && <p className="text-[10px] text-zinc-500 leading-snug mt-1">{data.customerAddress}</p>}
          </div>

          {/* Device details */}
          <div className="border border-zinc-200 rounded-lg p-3.5 space-y-1.5 bg-zinc-50/50">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
              Device Description
            </h3>
            <p className="text-sm font-black text-zinc-900 leading-none">{data.deviceBrand} {data.deviceModel}</p>
            <p className="text-zinc-700 leading-tight">Type: {data.deviceType}</p>
            <p className="text-mono font-bold text-zinc-800 leading-tight">
              IMEI/Serial: {data.imeiOrSerialNumber || "N/A"}
            </p>
          </div>
        </section>

        {/* Diagnosis & Resolution notes */}
        <section className="border border-zinc-200 rounded-lg p-3.5 my-5 space-y-2 bg-zinc-50/20">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Reported Issue</h4>
              <p className="text-[10.5px] italic text-zinc-700 mt-0.5">"{data.problemDescription}"</p>
            </div>
            <div>
              <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Technician Resolution</h4>
              <p className="text-[10.5px] font-semibold text-zinc-900 mt-0.5">
                {data.resolutionNotes || "Hardware diagnostics and physical parts integration successfully applied."}
              </p>
            </div>
          </div>
        </section>

        {/* Billable Items Table */}
        <section className="my-6">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-zinc-950 text-zinc-800 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2 w-[55%]">Service & Item Description</th>
                <th className="py-2 text-right w-[15%]">Rate</th>
                <th className="py-2 text-center w-[15%]">Qty</th>
                <th className="py-2 text-right w-[15%]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700 text-[10.5px]">
              {/* Labor Charge */}
              <tr>
                <td className="py-2.5 font-semibold text-zinc-900">
                  Professional Labor & Diagnostics
                  <span className="block text-[9px] text-zinc-400 font-normal leading-normal">
                    Hardware teardown, diagnostic board inspection, alignment, and final assembly testing.
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono">${data.laborCost.toFixed(2)}</td>
                <td className="py-2.5 text-center">1</td>
                <td className="py-2.5 text-right font-mono font-bold text-zinc-900">${data.laborCost.toFixed(2)}</td>
              </tr>
              {/* Allocated Parts */}
              {data.parts.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5">
                    <span className="font-semibold text-zinc-900">{item.partName}</span>
                    <span className="block text-[9px] text-zinc-400 font-normal">
                      Integrated replacement hardware part from stock inventory.
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-zinc-900">${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Calculations Block */}
        <section className="flex justify-end my-5">
          <div className="w-[300px] border border-zinc-200 rounded-lg p-3.5 space-y-2 bg-zinc-50/50 text-[11px]">
            <div className="flex justify-between text-zinc-600">
              <span>Labor Total:</span>
              <span className="font-mono">${data.laborCost.toFixed(2)}</span>
            </div>
            {data.parts.length > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Parts Total:</span>
                <span className="font-mono">${partsTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-950 font-black text-sm border-t border-zinc-300 pt-2">
              <span>Total Paid / Owed:</span>
              <span className="font-mono">${calculatedTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Warranty Disclaimer */}
        <section className="my-6 border-t border-zinc-200 pt-4 text-[9px] leading-relaxed text-zinc-500 text-justify">
          <p className="font-semibold text-zinc-700 uppercase tracking-wider text-[8px] mb-1">
            🛡️ Replacement Parts & Labor Warranty:
          </p>
          <p>
            1. **Parts Warranty:** Pines Multi-Telecom offers a thirty (30) day warranty on the specific hardware parts replaced in this invoice (e.g. replaced screen, battery, IC chip). This warranty covers manufacturer defects only.
          </p>
          <p>
            2. **Exclusions:** This warranty is immediately declared **VOID** if the device has signs of subsequent physical impact, drop damage, bent chassis, custom software tampering, or liquid exposure after checkout.
          </p>
          <p>
            3. **Labor Policy:** Diagnostics and labor fees are non-refundable once the service is rendered and the client checks out the device in working condition.
          </p>
        </section>

        {/* Signatures */}
        <section className="grid grid-cols-2 gap-12 mt-12 pt-4">
          <div className="flex flex-col items-center">
            <div className="w-full border-b border-zinc-400 h-6"></div>
            <span className="mt-1.5 text-[8px] font-black tracking-widest text-zinc-700 uppercase">
              Received By (Customer Name & Signature)
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full border-b border-zinc-400 h-6"></div>
            <span className="mt-1.5 text-[8px] font-black tracking-widest text-zinc-700 uppercase">
              Authorized Pines Representative
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-zinc-100 pt-3 text-center text-[8.5px] text-zinc-400 font-medium">
          <p>Thank you for choosing Pines Multi-Telecom! We appreciate your business.</p>
          <p className="mt-0.5 text-zinc-300">Powered by Beep Repair Management SaaS</p>
        </footer>
      </div>
    );
  }
);

InvoiceTemplate.displayName = "InvoiceTemplate";
