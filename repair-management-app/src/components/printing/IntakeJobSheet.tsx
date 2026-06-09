import React from "react";
import type { DeviceType } from "@/types/device";

export type IntakeJobSheetData = {
  ticketId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  deviceBrand: string;
  deviceModel: string;
  imeiOrSerialNumber: string | null;
  deviceType: DeviceType;
  problemDescription: string;
  estimatedCost: number | null;
  branchName: string;
  branchPhone?: string;
  branchAddress?: string;
  customConsentNotes?: string; // Custom risk warnings (e.g. reballing risk, liquid damage)
  companyName?: string; // ➕ Add this
  website?: string | null;
  businessNumber?: string | null;
  contactNumber?: string | null;
};

interface IntakeJobSheetProps {
  data: IntakeJobSheetData;
}

export const IntakeJobSheet = React.forwardRef<HTMLDivElement, IntakeJobSheetProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-[800px] bg-white p-8 font-sans text-xs text-zinc-900 border border-zinc-200 shadow-sm printable-job-sheet"
        style={{ boxSizing: "border-box" }}
      >
        {/* Header Grid */}
        <header className="flex justify-between items-start border-b-2 border-zinc-950 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-emerald-950 uppercase">
              {data.companyName || "PINES MULTI-TELECOM"}
            </h1>
            <p className="text-zinc-600 font-medium">{data.branchName}</p>
            {data.branchAddress && <p className="text-[10px] text-zinc-500 leading-snug">{data.branchAddress}</p>}
            {(data.branchPhone || data.contactNumber) && (
              <p className="text-[10px] text-zinc-500">
                Tel: {data.branchPhone || data.contactNumber}
              </p>
            )}
            {data.website && (
              <p className="text-[10px] text-zinc-500">
                Web: {data.website}
              </p>
            )}
            {data.businessNumber && (
              <p className="text-[10px] text-zinc-500 font-semibold">
                Business Reg / TIN: {data.businessNumber}
              </p>
            )}
          </div>
          <div className="text-right space-y-1">
            <div className="inline-block bg-zinc-950 text-white px-3 py-1 text-xs font-bold tracking-wider rounded uppercase">
              Intake Job Sheet
            </div>
            <h2 className="text-lg font-black tracking-wide text-zinc-950 mt-1">
              TICKET: {data.ticketId}
            </h2>
            <p className="text-[10px] text-zinc-500">
              Received: {new Date(data.createdAt).toLocaleString()}
            </p>
          </div>
        </header>


        <section className="grid grid-cols-2 gap-8 my-5">

          <div className="border border-zinc-200 rounded-lg p-3.5 space-y-2 bg-zinc-50/50">
            <h3 className="text-xs font-black uppercase text-zinc-800 tracking-wider border-b border-zinc-200 pb-1">
              Customer Details
            </h3>
            <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-zinc-700">
              <span className="font-bold text-zinc-500">Full Name:</span>
              <span className="font-semibold text-zinc-900">{data.customerName}</span>
              <span className="font-bold text-zinc-500">Phone:</span>
              <span className="font-semibold text-zinc-900">{data.customerPhone}</span>
              <span className="font-bold text-zinc-500">Email:</span>
              <span>{data.customerEmail || "N/A"}</span>
              <span className="font-bold text-zinc-500">Address:</span>
              <span className="text-[10px] leading-tight">{data.customerAddress || "N/A"}</span>
            </div>
          </div>


          <div className="border border-zinc-200 rounded-lg p-3.5 space-y-2 bg-zinc-50/50">
            <h3 className="text-xs font-black uppercase text-zinc-800 tracking-wider border-b border-zinc-200 pb-1">
              Device Intake Details
            </h3>
            <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-zinc-700">
              <span className="font-bold text-zinc-500">Brand:</span>
              <span className="font-semibold text-zinc-900">{data.deviceBrand}</span>
              <span className="font-bold text-zinc-500">Model:</span>
              <span className="font-semibold text-zinc-900">{data.deviceModel}</span>
              <span className="font-bold text-zinc-500">Device Type:</span>
              <span>{data.deviceType}</span>
              <span className="font-bold text-zinc-500">IMEI/Serial:</span>
              <span className="font-mono break-all font-bold text-zinc-900">
                {data.imeiOrSerialNumber || "N/A (Bypassed)"}
              </span>
            </div>
          </div>
        </section>


        <section className="border border-zinc-200 rounded-lg p-3.5 my-5">
          <h3 className="text-xs font-black uppercase text-zinc-800 tracking-wider border-b border-zinc-200 pb-1.5 mb-3">
            📋 Initial Condition Check & Inspection Report
          </h3>
          <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-600 w-16">Power State:</span>
              <span className="flex gap-2">
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Power ON</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Power OFF</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">No Power</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-600 w-16">Display state:</span>
              <span className="flex gap-2">
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Intact</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Cracked</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">No Display</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-600 w-16">Touch input:</span>
              <span className="flex gap-2">
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">OK</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Defective</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Untestable</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-600 w-16">Liquid Contact:</span>
              <span className="flex gap-2">
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">None</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Traces</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Severe</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-600 w-16">Charging:</span>
              <span className="flex gap-2">
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">OK</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Defective</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Untested</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-600 w-16">Chassis:</span>
              <span className="flex gap-2">
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">OK</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Bent</span>
                <span className="border border-zinc-400 px-1.5 py-0.5 rounded text-[8px]">Severe Dmg</span>
              </span>
            </div>
          </div>
        </section>

        {/* Problem Description Panel */}
        <section className="border border-zinc-200 rounded-lg p-3.5 my-5 space-y-1.5">
          <h3 className="text-xs font-black uppercase text-zinc-800 tracking-wider border-b border-zinc-200 pb-1">
            Problem Description (Client Declared)
          </h3>
          <p className="text-zinc-700 italic bg-zinc-50 p-3 rounded border border-zinc-200/60 leading-relaxed text-[11px] whitespace-pre-wrap">
            "{data.problemDescription}"
          </p>
        </section>

        {/* Crucial Consent & Technician Notes Section */}
        <section className="border-2 border-red-500/80 rounded-lg p-3.5 my-5 space-y-1.5 bg-red-50/10">
          <h3 className="text-xs font-black uppercase text-red-700 tracking-wider border-b border-red-200 pb-1">
            ⚠️ CRITICAL DIAGNOSTIC NOTES & CUSTOM LIABILITY CONSENT
          </h3>
          <p className="text-zinc-800 font-bold bg-white p-3 rounded border border-red-200 leading-relaxed text-[11.5px] whitespace-pre-wrap">
            {data.customConsentNotes?.trim() ? data.customConsentNotes : "No additional high-risk warning flags declared. Standard repair diagnostics apply."}
          </p>
        </section>

        {/* Estimate Details */}
        <section className="flex justify-between items-center border border-zinc-200 rounded-lg p-3.5 my-5 bg-zinc-50/50">
          <span className="text-zinc-700 font-black uppercase tracking-wider text-xs">Estimate summary</span>
          <div className="text-right">
            <span className="text-xs text-zinc-500 font-medium mr-2">Initial Estimated Cost:</span>
            <span className="text-sm font-black text-zinc-950">
              {data.estimatedCost !== null ? `₱${data.estimatedCost.toFixed(2)}` : "TBD (Subject to Diagnostic)"}
            </span>
          </div>
        </section>

        {/* Terms and Conditions / Liability Consent */}
        <section className="my-6 space-y-2 border-t border-zinc-200 pt-4 text-[9px] leading-relaxed text-zinc-500 text-justify">
          <p className="font-semibold text-zinc-700 uppercase tracking-wider text-[8px] mb-1">
            📜 Repair Terms & Conditions & Liability Release Statement:
          </p>
          <p>
            1. **Risk Acknowledgement:** The customer acknowledges that devices submitted for diagnostics or repair—especially those with pre-existing liquid exposure, physical trauma, or motherboard/power issues—carry a high inherent risk of further degradation or complete power failure during the diagnostics process.
          </p>
          <p>
            2. **Data Policy:** {data.companyName || "Pines Multi-Telecom"} takes no responsibility for user files, operating software, or cloud account linkages. The customer is solely responsible for backing up their data prior to submission.
          </p>
          <p>
            3. **Unclaimed Devices:** All repair jobs completed or declared unrepairable must be picked up within ninety (90) calendar days of notification. Devices left beyond 90 days will be disposed of or sold to recover cost of diagnostics and storage.
          </p>
        </section>

        {/* Signatures */}
        <section className="grid grid-cols-2 gap-12 mt-12 pt-4">
          <div className="flex flex-col items-center">
            <div className="w-full border-b border-zinc-400 h-6"></div>
            <span className="mt-1.5 text-[8px] font-black tracking-widest text-zinc-700 uppercase">
              Customer Signature over Printed Name
            </span>
            <span className="text-[7.5px] text-zinc-400 mt-0.5">Date: ________________________</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full border-b border-zinc-400 h-6"></div>
            <span className="mt-1.5 text-[8px] font-black tracking-widest text-zinc-700 uppercase">
              Receiving Technician Signature
            </span>
            <span className="text-[7.5px] text-zinc-400 mt-0.5">Date: ________________________</span>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-zinc-100 pt-3 text-center text-[8.5px] text-zinc-400 font-medium">
          <p>Thank you for trusting {data.companyName || "Pines Multi-Telecom"} with your device!</p>
          <p className="mt-0.5 text-zinc-300">Powered by Beep Repair Management SaaS</p>
        </footer>
      </div>
    );
  }
);

IntakeJobSheet.displayName = "IntakeJobSheet";
