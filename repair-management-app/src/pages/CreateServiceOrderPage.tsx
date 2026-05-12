import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useServiceOrderWizardStore from "@/store/serviceOrderWizardStore";

const steps = [
  "1. Device Lookup (IMEI/Serial)",
  "2. Customer Confirm/Edit",
  "3. Repair Job Details",
  "4. Confirmation",
];

const CreateServiceOrderPage = () => {
  const currentStep = useServiceOrderWizardStore((state) => state.currentStep);
  const identifier = useServiceOrderWizardStore((state) => state.identifier);
  const lookUpStatus = useServiceOrderWizardStore(
    (state) => state.lookUpStatus,
  );
  const lookUpMessage = useServiceOrderWizardStore(
    (state) => state.lookUpMessage,
  );
  const setIdentifier = useServiceOrderWizardStore(
    (state) => state.setIdentifier,
  );
  const goToStep = useServiceOrderWizardStore((state) => state.goToStep);

  const startLookup = useServiceOrderWizardStore((state) => state.startLookup);
  const completeLookup = useServiceOrderWizardStore(
    (state) => state.completeLookup,
  );

  const handleGoToStep2 = () => {
    startLookup();
    if (!identifier.trim()) {
      completeLookup("error", "IMEI / Serial Number is required.");
      return;
    }

    if (!identifier.match(/^[a-zA-Z0-9]+$/)) {
      completeLookup("error", "Identifier must be alphanumeric.");
      return;
    } else {
      completeLookup("found", "Device found with provided identifier.");
    }

    goToStep(2);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-sm">
      <header>
        <h1 className="text-2xl font-semibold text-emerald-950">
          Create Service Order
        </h1>
        <p className="mt-1 text-sm text-emerald-900/70">
          F8 scaffold: wizard shell only. We will implement one step at a time.
        </p>
      </header>

      <ol className="space-y-2 text-sm text-emerald-900">
        {steps.map((step, index) => (
          <li
            key={step}
            className={`rounded-md border px-3 py-2 ${
              index + 1 === currentStep
                ? "border-emerald-300 bg-emerald-100/70 font-medium"
                : "border-emerald-100 bg-emerald-50/40"
            }`}
          >
            {step}
          </li>
        ))}
      </ol>

      {currentStep === 1 ? (
        <section className="space-y-4 rounded-xl border border-emerald-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-emerald-950">
            Step 1: Device Lookup
          </h2>

          <label className="space-y-1 text-sm text-emerald-950">
            <span>IMEI / Serial Number</span>
            <Input
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                if (lookUpStatus === "error") {
                  completeLookup("idle", null);
                }
              }}
              placeholder="Enter IMEI or serial number"
              aria-label="IMEI or serial number"
            />
          </label>

          {lookUpStatus === "error" && lookUpMessage ? (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {lookUpMessage}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button onClick={handleGoToStep2}>
              Next: Customer Confirm/Edit
            </Button>
          </div>
        </section>
      ) : (
        <section className="space-y-4 rounded-xl border border-emerald-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-emerald-950">
            Step 2 Placeholder
          </h2>
          <p className="text-sm text-emerald-900/70">
            Next slice: implement customer confirm/edit based on the lookup
            result.
          </p>
          <p className="text-sm text-emerald-900/80">
            Captured identifier: <strong>{identifier}</strong>
          </p>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => goToStep(1)}>
              Back to Step 1
            </Button>
          </div>
        </section>
      )}
    </section>
  );
};

export default CreateServiceOrderPage;
