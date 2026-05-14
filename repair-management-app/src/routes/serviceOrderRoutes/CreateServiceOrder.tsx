import parseApiError from "@/api/parseApiError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useLookupDeviceByIdentifier } from "@/hooks/useDevices";
import { useCreateDevice } from "@/hooks/useDevices";
import { useCreateRepairJob } from "@/hooks/useRepairJobs";
import {
  buildCreateRepairJobRequest,
  buildServiceOrderCreateInput,
} from "@/routes/serviceOrderRoutes/serviceOrderMappers";
import { serviceOrderCreateInputSchema } from "@/routes/serviceOrderRoutes/serviceOrderSchema";
import useAuthStore from "@/store/authStore";
import useServiceOrderWizardStore from "@/store/serviceOrderWizardStore";
import type { DeviceType } from "@/types/device";
import type { ServiceOrderCreateInput } from "@/types/serviceOrder";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = [
  "1. Device Lookup (IMEI/Serial)",
  "2. Customer Confirm/Edit",
  "3. Repair Job Details",
  "4. Confirmation",
];

const normalizeFieldKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const buildFieldErrorDetails = (fieldErrors: Record<string, string[]>) =>
  Object.entries(fieldErrors)
    .flatMap(([fieldName, messages]) =>
      messages
        .filter((message) => Boolean(message))
        .map((message) => `${fieldName}: ${message}`),
    )
    .join("\n");

const isStep2Field = (normalizedFieldName: string) =>
  [
    "fullname",
    "phone",
    "email",
    "address",
    "brand",
    "model",
    "serialnumber",
    "imeiorserialnumber",
    "devicetype",
  ].includes(normalizedFieldName);

const isStep3Field = (normalizedFieldName: string) =>
  ["problemdescription", "estimatedcost"].includes(normalizedFieldName);

const CreateServiceOrder = () => {
  const [inputPreview, setInputPreview] = useState<string | null>(null);
  const [inputPreviewError, setInputPreviewError] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [newDevice, setNewDevice] = useState<{
    brand: string;
    model: string;
    imeiOrSerialNumber: string;
    deviceType: DeviceType;
  }>({
    brand: "",
    model: "",
    imeiOrSerialNumber: "",
    deviceType: "Mobile",
  });
  const [repairDetailsForm, setRepairDetailsForm] = useState({
    problemDescription: "",
    estimatedCost: "",
  });
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

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
  const matchedCustomerName = useServiceOrderWizardStore(
    (state) => state.matchedCustomerName,
  );
  const matchedCustomerId = useServiceOrderWizardStore(
    (state) => state.matchedCustomerId,
  );
  const matchedCustomerPhone = useServiceOrderWizardStore(
    (state) => state.matchedCustomerPhone,
  );
  const matchedDeviceId = useServiceOrderWizardStore(
    (state) => state.matchedDeviceId,
  );
  const matchedDeviceLabel = useServiceOrderWizardStore(
    (state) => state.matchedDeviceLabel,
  );
  const setLookupMatch = useServiceOrderWizardStore(
    (state) => state.setLookupMatch,
  );
  const clearLookupMatch = useServiceOrderWizardStore(
    (state) => state.clearLookupMatch,
  );
  const resetWizard = useServiceOrderWizardStore((state) => state.resetWizard);

  const { mutateAsync: lookupDevice, isPending: isLookupPending } =
    useLookupDeviceByIdentifier();
  const { mutateAsync: createCustomer, isPending: isCreateCustomerPending } =
    useCreateCustomer();
  const { mutateAsync: createDevice, isPending: isCreateDevicePending } =
    useCreateDevice();
  const { mutateAsync: createRepairJob, isPending: isCreateRepairJobPending } =
    useCreateRepairJob();

  const isSubmittingServiceOrder =
    isCreateCustomerPending ||
    isCreateDevicePending ||
    isCreateRepairJobPending;

  const handleGoToStep2 = async () => {
    startLookup();
    clearLookupMatch();

    if (!identifier.trim()) {
      completeLookup("error", "IMEI / Serial Number is required.");
      return;
    }

    if (!identifier.match(/^[a-zA-Z0-9]+$/)) {
      completeLookup("error", "Identifier must be alphanumeric.");
      return;
    }

    try {
      const lookup = await lookupDevice(identifier.trim());

      const deviceLabel = `${lookup.brand} ${lookup.model}`.trim();
      setLookupMatch(
        lookup.customerId,
        lookup.customerName,
        lookup.customerPhone,
        lookup.deviceId,
        deviceLabel,
      );

      completeLookup(
        "found",
        "Device found. Proceed to customer confirmation.",
      );
      goToStep(2);
    } catch (error) {
      const parsed = parseApiError(error);

      if (parsed.status === 404) {
        completeLookup(
          "not-found",
          "No device found with that IMEI / Serial Number.",
        );
        return;
      }

      completeLookup("error", parsed.message ?? "Lookup failed. Please retry.");
    }
  };

  const handleContinueWithoutMatch = () => {
    clearLookupMatch();
    completeLookup(
      "not-found",
      "Proceeding with new customer/device intake for this Service Order.",
    );
    goToStep(2);
  };

  const buildAndValidateServiceOrderInput =
    (): ServiceOrderCreateInput | null => {
      setInputPreview(null);
      setInputPreviewError(null);

      try {
        const estimatedCost = repairDetailsForm.estimatedCost.trim()
          ? Number(repairDetailsForm.estimatedCost)
          : null;

        if (
          estimatedCost !== null &&
          (Number.isNaN(estimatedCost) || estimatedCost < 0)
        ) {
          throw new Error(
            "Estimated cost must be a valid non-negative number.",
          );
        }

        const input = buildServiceOrderCreateInput({
          matchedCustomerId,
          matchedDeviceId,
          repairDetails: {
            problemDescription: repairDetailsForm.problemDescription,
            estimatedCost,
          },
          customerIntake: {
            fullName: newCustomer.fullName,
            phone: newCustomer.phone,
            email: newCustomer.email.trim() ? newCustomer.email.trim() : null,
            address: newCustomer.address.trim()
              ? newCustomer.address.trim()
              : null,
          },
          deviceIntake: {
            brand: newDevice.brand,
            model: newDevice.model,
            imeiOrSerialNumber: newDevice.imeiOrSerialNumber.trim()
              ? newDevice.imeiOrSerialNumber.trim()
              : null,
            deviceType: newDevice.deviceType,
          },
        });

        const validated = serviceOrderCreateInputSchema.safeParse(input);

        if (!validated.success) {
          const details = validated.error.issues
            .map((issue) => {
              const path =
                issue.path.length > 0 ? issue.path.join(".") : "input";
              return `${path}: ${issue.message}`;
            })
            .join("\n");

          setInputPreviewError(`Validation failed:\n${details}`);
          return null;
        }

        setInputPreview(JSON.stringify(validated.data, null, 2));
        return validated.data;
      } catch (error) {
        setInputPreviewError(
          error instanceof Error
            ? error.message
            : "Unable to prepare service order data.",
        );
        return null;
      }
    };

  const handleGoToStep4 = () => {
    const validatedInput = buildAndValidateServiceOrderInput();

    if (!validatedInput) {
      return;
    }

    goToStep(4);
  };

  const handleSubmitServiceOrder = async () => {
    setSubmitError(null);

    if (!user?.branchId) {
      setSubmitError("Missing branch context. Please sign in again.");
      return;
    }

    const validatedInput = buildAndValidateServiceOrderInput();
    if (!validatedInput) {
      setSubmitError("Please fix validation errors before submission.");
      goToStep(3);
      return;
    }

    try {
      let newIntakeResolvedIds:
        | {
            customerId: string;
            deviceId: string;
          }
        | undefined;

      if (validatedInput.mode === "new-intake") {
        const createdCustomer = await createCustomer({
          ...validatedInput.customer,
          branchId: user.branchId,
        });

        const createdDevice = await createDevice({
          ...validatedInput.device,
          customerId: createdCustomer.id,
          branchId: user.branchId,
        });

        newIntakeResolvedIds = {
          customerId: createdCustomer.id,
          deviceId: createdDevice.id,
        };
      }

      const request = buildCreateRepairJobRequest({
        branchId: user.branchId,
        input: validatedInput,
        newIntakeResolvedIds,
      });

      const createdRepairJob = await createRepairJob(request);

      resetWizard();
      navigate(`/repair-jobs/${createdRepairJob.id}`, { replace: true });
    } catch (error) {
      const parsed = parseApiError(error);

      if (parsed.fieldErrors) {
        const fieldNames = Object.keys(parsed.fieldErrors).map(
          normalizeFieldKey,
        );
        const hasStep2Error = fieldNames.some(isStep2Field);
        const hasStep3Error = fieldNames.some(isStep3Field);

        if (hasStep2Error) {
          goToStep(2);
        } else if (hasStep3Error) {
          goToStep(3);
        }

        const details = buildFieldErrorDetails(parsed.fieldErrors);
        const baseMessage = parsed.message ?? "Unable to create service order.";

        setSubmitError(details ? `${baseMessage}\n${details}` : baseMessage);
        return;
      }

      if (parsed.status === 403) {
        setSubmitError(
          "Not allowed to create this service order in the current branch.",
        );
        return;
      }

      if (parsed.status === 404) {
        setSubmitError(
          "Related records were not found. Please re-check customer/device and try again.",
        );
        goToStep(2);
        return;
      }

      setSubmitError(parsed.message ?? "Unable to create service order.");
    }
  };

  /*
    Submission flow preview (not wired yet):

    1) Build ServiceOrderCreateInput from wizard state.
    2) If mode is "new-intake":
       - call createCustomer(customer)
       - call createDevice({ ...device, customerId })
       - keep resolved IDs from those results
    3) Build final repair-job payload:
       const request = buildCreateRepairJobRequest({
         branchId: authBranchId,
         input,
         newIntakeResolvedIds, // only for new-intake mode
       });
    4) call createRepairJob(request)
    5) redirect to repair job detail/list on success
  */

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
                if (lookUpStatus === "error" || lookUpStatus === "not-found") {
                  completeLookup("idle", null);
                }
                clearLookupMatch();
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

          {lookUpStatus === "not-found" && lookUpMessage ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {lookUpMessage}
            </p>
          ) : null}

          {lookUpStatus === "not-found" ? (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleContinueWithoutMatch}>
                Continue With New Customer/Device
              </Button>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button onClick={handleGoToStep2} disabled={isLookupPending}>
              {isLookupPending
                ? "Looking up..."
                : "Next: Customer Confirm/Edit"}
            </Button>
          </div>
        </section>
      ) : currentStep === 2 ? (
        <section className="space-y-4 rounded-xl border border-emerald-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-emerald-950">Step 2</h2>
          {matchedDeviceId ? (
            <>
              <p className="text-sm text-emerald-900/70">
                Existing Match Mode: confirm this existing customer and device
                for the new Service Order.
              </p>
              <div className="grid gap-2 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-sm text-emerald-900">
                <p>
                  Lookup identifier: <strong>{identifier}</strong>
                </p>
                <p>
                  Customer name: <strong>{matchedCustomerName ?? "-"}</strong>
                </p>
                <p>
                  Customer phone: <strong>{matchedCustomerPhone ?? "-"}</strong>
                </p>
                <p>
                  Device: <strong>{matchedDeviceLabel ?? "-"}</strong>
                </p>
              </div>
              <p className="text-sm text-emerald-900/70">
                Next slice: add optional edit controls, then continue to Step 3
                (Repair Job Details).
              </p>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => goToStep(1)}>
                  Back to Step 1
                </Button>
                <Button onClick={() => goToStep(3)}>
                  Next: Repair Job Details
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-emerald-900/70">
                New Intake Mode: no existing device/customer match selected.
              </p>
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Step 2 will collect new customer and device details, then create
                those records before creating the Service Order.
              </p>

              <div className="grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                <h3 className="text-sm font-semibold text-emerald-950">
                  Customer Intake
                </h3>
                <Input
                  value={newCustomer.fullName}
                  onChange={(event) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      fullName: event.target.value,
                    }))
                  }
                  placeholder="Full name"
                />
                <Input
                  value={newCustomer.phone}
                  onChange={(event) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="Phone"
                />
                <Input
                  value={newCustomer.email}
                  onChange={(event) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Email (optional)"
                />
                <Input
                  value={newCustomer.address}
                  onChange={(event) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                  placeholder="Address (optional)"
                />
              </div>

              <div className="grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                <h3 className="text-sm font-semibold text-emerald-950">
                  Device Intake
                </h3>
                <Input
                  value={newDevice.brand}
                  onChange={(event) =>
                    setNewDevice((prev) => ({
                      ...prev,
                      brand: event.target.value,
                    }))
                  }
                  placeholder="Brand"
                />
                <Input
                  value={newDevice.model}
                  onChange={(event) =>
                    setNewDevice((prev) => ({
                      ...prev,
                      model: event.target.value,
                    }))
                  }
                  placeholder="Model"
                />
                <Input
                  value={newDevice.imeiOrSerialNumber}
                  onChange={(event) =>
                    setNewDevice((prev) => ({
                      ...prev,
                      imeiOrSerialNumber: event.target.value,
                    }))
                  }
                  placeholder="IMEI / Serial Number (optional)"
                />
                <select
                  className="h-10 rounded-md border border-emerald-200 bg-white px-3 text-sm text-emerald-950 outline-none"
                  value={newDevice.deviceType}
                  onChange={(event) =>
                    setNewDevice((prev) => ({
                      ...prev,
                      deviceType: event.target.value as DeviceType,
                    }))
                  }
                  aria-label="Device type"
                >
                  <option value="Mobile">Mobile</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => goToStep(1)}>
                  Back to Step 1
                </Button>
                <Button onClick={() => goToStep(3)}>
                  Next: Repair Job Details
                </Button>
              </div>
            </>
          )}
        </section>
      ) : currentStep === 3 ? (
        <section className="space-y-4 rounded-xl border border-emerald-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-emerald-950">Step 3</h2>

          <div className="grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
            <h3 className="text-sm font-semibold text-emerald-950">
              Repair Details
            </h3>
            <Input
              value={repairDetailsForm.problemDescription}
              onChange={(event) =>
                setRepairDetailsForm((prev) => ({
                  ...prev,
                  problemDescription: event.target.value,
                }))
              }
              placeholder="Problem description"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={repairDetailsForm.estimatedCost}
              onChange={(event) =>
                setRepairDetailsForm((prev) => ({
                  ...prev,
                  estimatedCost: event.target.value,
                }))
              }
              placeholder="Estimated cost (optional)"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => goToStep(2)}>
              Back to Step 2
            </Button>

            <Button onClick={handleGoToStep4}>Next: Review and Submit</Button>
          </div>

          {inputPreviewError ? (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {inputPreviewError}
            </p>
          ) : null}

          {inputPreview ? (
            <pre className="overflow-x-auto rounded-md border border-emerald-100 bg-emerald-50/40 p-3 text-xs text-emerald-950">
              {inputPreview}
            </pre>
          ) : null}
        </section>
      ) : (
        <section className="space-y-4 rounded-xl border border-emerald-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-emerald-950">Step 4</h2>
          <p className="text-sm text-emerald-900/70">
            Review the built input, then create the service order.
          </p>

          <h3 className="text-sm font-semibold text-emerald-950">
            Service Order Summary
          </h3>

          {inputPreview ? (
            <pre className="overflow-x-auto rounded-md border border-emerald-100 bg-emerald-50/40 p-3 text-xs text-emerald-950">
              {inputPreview}
            </pre>
          ) : (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Service order details are not ready yet. Go back to Step 3 and
              complete required fields.
            </p>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => goToStep(3)}>
              Back to Step 3
            </Button>
            <Button
              onClick={handleSubmitServiceOrder}
              disabled={isSubmittingServiceOrder}
            >
              {isSubmittingServiceOrder
                ? "Creating Service Order..."
                : "Create Service Order"}
            </Button>
          </div>

          {submitError ? (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}
        </section>
      )}
    </section>
  );
};

export default CreateServiceOrder;
