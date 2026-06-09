import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { IntakeJobSheet } from "@/components/printing/IntakeJobSheet";
import type { DeviceType } from "@/types/device";
import { useGetPublicTenant } from "@/hooks/useTenants"; // ➕ Add this

interface IntakeSuccessScreenProps {
  createdJob: {
    id: string;
    jobNumber: string;
    createdAtUtc: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
    customerAddress?: string | null;
    deviceBrand: string;
    deviceModel: string;
    deviceType: DeviceType;
    imeiOrSerialNumber: string | null;
    problemDescription: string;
    estimatedCost: number | null;
  };
  onReset: () => void;
}

export const IntakeSuccessScreen: React.FC<IntakeSuccessScreenProps> = ({
  createdJob,
  onReset,
}) => {
  const [customConsentNotes, setCustomConsentNotes] = useState<string>("");
  const { data: tenant } = useGetPublicTenant();
  const companyName = tenant?.companyName || "Pines Multi-Telecom";

  const intakeRef = useRef<HTMLDivElement>(null);
  const handlePrintIntake = useReactToPrint({
    contentRef: intakeRef,
  });

  return (
    <section className="space-y-6 rounded-2xl border border-emerald-100/70 bg-white p-8 shadow-sm text-center max-w-[600px] mx-auto my-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-emerald-950">
          Service Order Created!
        </h1>
        <p className="text-sm text-emerald-900/60 leading-relaxed">
          Ticket <strong className="text-emerald-950 font-black">{createdJob.jobNumber}</strong> has been successfully opened in our system under branch context.
        </p>
      </header>

      {/* Condition / Diagnostic Consent Overrides */}
      <div className="border border-zinc-200 rounded-xl p-4 text-left space-y-3 bg-zinc-50/50">
        <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">
          ⚙ ... Print Consent Customization
        </h3>
        <label className="block space-y-1 text-xs text-zinc-700">
          <span className="font-semibold">Technician Diagnostic Notes & Consent Release (Prints on A4 Sheet):</span>
          <textarea
            className="w-full h-24 rounded-md border border-zinc-300 bg-white p-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-sans text-sm text-zinc-800"
            placeholder="e.g. Liquid damage CPU reballing requested. Water damage voids all warranty. Customer acknowledges 50% success rate."
            value={customConsentNotes}
            onChange={(e) => setCustomConsentNotes(e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button
          size="lg"
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-sm cursor-pointer"
          onClick={() => handlePrintIntake()}
        >
          📋 Print Intake Job Sheet & Consent
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full py-6 text-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium cursor-pointer"
          onClick={onReset}
        >
          Go to Repair Details ➡️
        </Button>
      </div>

      {/* Hidden template for printing */}
      <div style={{ display: "none" }}>
        <IntakeJobSheet
          ref={intakeRef}
          data={{
            ticketId: createdJob.jobNumber,
            createdAt: createdJob.createdAtUtc,
            customerName: createdJob.customerName,
            customerPhone: createdJob.customerPhone,
            customerEmail: createdJob.customerEmail,
            customerAddress: createdJob.customerAddress,
            deviceBrand: createdJob.deviceBrand,
            deviceModel: createdJob.deviceModel,
            deviceType: createdJob.deviceType,
            imeiOrSerialNumber: createdJob.imeiOrSerialNumber,
            problemDescription: createdJob.problemDescription,
            estimatedCost: createdJob.estimatedCost,
            branchName: `${companyName} - Main`,
            branchPhone: "+63 74 442 1234",
            branchAddress: "45 Session Road, Baguio City, Philippines",
            customConsentNotes: customConsentNotes,
            companyName: companyName,
          }}
        />
      </div>
    </section>
  );
};
