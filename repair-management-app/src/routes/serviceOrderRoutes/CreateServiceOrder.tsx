import parseApiError from "@/api/parseApiError";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useLookupDeviceByIdentifier, useLookupImeiDetails } from "@/hooks/useDevices";
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
import { IntakeSuccessScreen } from "./IntakeSuccessScreen";

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
  const noIdentifierAvailable = useServiceOrderWizardStore((state) => state.noIdentifierAvailable);
  const setNoIdentifierBypass = useServiceOrderWizardStore((state) => state.setNoIdentifierBypass);

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
  const setCreateJob = useServiceOrderWizardStore((state) => state.setCreateJob);
  const createJob = useServiceOrderWizardStore((state) => state.createJob);
  const { mutateAsync: lookupImeiDetails, isPending: isImeiLookupPending } =
    useLookupImeiDetails();
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

      if (parsed.status === 403) {
        completeLookup(
          "error",
          "You do not have permission to access this device identifier.",
        );
        return;
      }

      if (parsed.status === 404) {
        try {
          completeLookup("loading", "Device not found locally. Checking IMEI registry...");

          // Query our secure proxy API
          const imeiDetails = await lookupImeiDetails(identifier.trim());

          // 1. Auto-fill the new device form fields!
          setNewDevice((prev) => ({
            ...prev,
            brand: imeiDetails.brand,
            model: imeiDetails.model,
            imeiOrSerialNumber: identifier.trim(),
            deviceType: imeiDetails.deviceType,
          }));

          // 2. Report success, state change, and transition
          completeLookup(
            "not-found",
            `Device registry check succeeded! Found ${imeiDetails.brand} ${imeiDetails.model}. Auto-populating details.`,
          );
          goToStep(2);
        } catch (registryError) {
          // If both local and registry check fail, let them enter it manually
          completeLookup(
            "not-found",
            "No matching device found in local database or registry. You can create a new record.",
          );
          goToStep(2);
        }
        return;
      }

    }
  };

  const handleContinueWithoutMatch = () => {
    clearLookupMatch();
    completeLookup(
      "not-found",
      "Proceeding with new customer/device intake for this Service Order.",
    );
    setNewDevice((prev) => ({
      ...prev,
      imeiOrSerialNumber: identifier.trim(), // ➕ Auto-populate the entered serial number
    }));
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

      setCreateJob({
        id: createdRepairJob.id,
        jobNumber: createdRepairJob.jobNumber,
        createdAtUtc: createdRepairJob.createdAtUtc,
        customerName: validatedInput.mode === "new-intake" ? newCustomer.fullName : matchedCustomerName ?? "Unknown Customer",
        customerPhone: validatedInput.mode === "new-intake" ? newCustomer.phone : matchedCustomerPhone ?? "N/A",
        customerEmail: validatedInput.mode === "new-intake" ? newCustomer.email : null,
        customerAddress: validatedInput.mode === "new-intake" ? newCustomer.address : null,
        deviceBrand: validatedInput.mode === "new-intake" ? newDevice.brand : matchedDeviceLabel?.split(" ")[0] ?? "Unknown Brand",
        deviceModel: validatedInput.mode === "new-intake" ? newDevice.model : matchedDeviceLabel?.split(" ").slice(1).join(" ") ?? "Unknown Model",
        deviceType: validatedInput.mode === "new-intake" ? newDevice.deviceType : "Mobile",
        imeiOrSerialNumber: validatedInput.mode === "new-intake" ? newDevice.imeiOrSerialNumber : identifier,
        problemDescription: repairDetailsForm.problemDescription,
        estimatedCost: repairDetailsForm.estimatedCost ? Number(repairDetailsForm.estimatedCost) : null,
      });
    } catch (error) {
      console.error("Failed to submit service order:", error);
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

      let displayMessage = parsed.message;
      if (displayMessage === "An unknown error occurred" && axios.isAxiosError(error) && error.response?.status) {
        const responseData = error.response.data;
        if (typeof responseData === "string" && responseData.includes("<!DOCTYPE")) {
          displayMessage = `Server HTML Error (${error.response.status}): ${error.response.statusText || "Internal Server Error"}`;
        } else {
          displayMessage = `Server Error (${error.response.status}): ${error.response.statusText || "Unknown Error"}`;
        }
      }

      setSubmitError(displayMessage ?? "Unable to create service order.");
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

  if (createJob) {
    return (
      <IntakeSuccessScreen
        createdJob={createJob}
        onReset={() => {
          const jobId = createJob.id;
          resetWizard(); // 🧹 Zustand cleans up the store and resets createJob to null!
          navigate(`/repair-jobs/${jobId}`, { replace: true });
        }}
      />
    );
  }


  const progressValue = (currentStep / steps.length) * 100;

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Create Service Order
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          F8 scaffold: wizard shell only. We will implement one step at a time.
        </p>
      </header>

      {/* Modern Progress Bar UI */}
      <div className="space-y-2 rounded-xl border border-slate-100 dark:border-zinc-800/40 bg-slate-50/50 dark:bg-zinc-900/30 p-4">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          <span>{steps[currentStep - 1]}</span>
          <span>Step {currentStep} of {steps.length}</span>
        </div>
        <Progress value={progressValue} className="h-2 bg-slate-100 dark:bg-zinc-800" />
      </div>

      {currentStep === 1 ? (
        <section className="space-y-6 bg-slate-50/20 dark:bg-zinc-900/10 p-6 rounded-xl border border-slate-100 dark:border-zinc-800/40">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">
            Step 1: Device Lookup
          </h2>

          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300 block">
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

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-zinc-400">
                Can't find or read the device identifier?
              </span>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline"
                onClick={() => {
                  const branchCode = user?.branchId ? user.branchId.slice(0, 4) : "GEN";
                  setNoIdentifierBypass(branchCode);

                  // Read the newly generated temporary tracking ID from Zustand store and pre-fill form
                  const tempTag = useServiceOrderWizardStore.getState().identifier;
                  setNewDevice((prev) => ({
                    ...prev,
                    imeiOrSerialNumber: tempTag,
                  }));
                  goToStep(2);
                }}

              >
                Generate Temporary ID & Skip Lookup
              </Button>
            </div>

          </label>



          {lookUpStatus === "error" && lookUpMessage ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {lookUpMessage}
            </p>
          ) : null}

          {lookUpStatus === "not-found" && lookUpMessage ? (
            <p className="rounded-md border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              {lookUpMessage}
            </p>
          ) : null}

          {lookUpStatus === "not-found" ? (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleContinueWithoutMatch} className="h-10 px-5 rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer font-medium">
                Continue With New Customer/Device
              </Button>
            </div>
          ) : null}

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800/40">
            <Button 
              onClick={handleGoToStep2} 
              disabled={isLookupPending || isImeiLookupPending} 
              className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors cursor-pointer font-medium"
            >
              {isLookupPending || isImeiLookupPending ? (
                "Looking up..."
              ) : (
                <span className="flex items-center gap-2">
                  Next: Customer Confirm/Edit
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </section>
      ) : currentStep === 2 ? (
        <section className="space-y-6 bg-slate-50/20 dark:bg-zinc-900/10 p-6 rounded-xl border border-slate-100 dark:border-zinc-800/40">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">Step 2: Customer Confirm/Edit</h2>
          {matchedDeviceId ? (
            <>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Existing Match Mode: confirm this existing customer and device
                for the new Service Order.
              </p>
              <div className="grid gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-sm text-slate-700 dark:text-zinc-300 shadow-xs">
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
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Next slice: add optional edit controls, then continue to Step 3
                (Repair Job Details).
              </p>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/40">
                <Button 
                  variant="outline" 
                  onClick={() => goToStep(1)} 
                  className="h-10 px-5 rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer font-medium"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Step 1
                  </span>
                </Button>
                <Button 
                  onClick={() => goToStep(3)} 
                  className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors cursor-pointer font-medium"
                >
                  <span className="flex items-center gap-2">
                    Next: Repair Job Details
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                New Intake Mode: no existing device/customer match selected.
              </p>
              <p className="rounded-md border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                Step 2 will collect new customer and device details, then create
                those records before creating the Service Order.
              </p>

              {noIdentifierAvailable && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive space-y-1">
                  <p className="font-semibold">⚠️ Bypass Mode Active</p>
                  <p className="text-xs text-destructive/90">
                    This device is registered under temporary tracking ID <strong>{identifier}</strong>.
                    Remember to replace this with the real IMEI/Serial in the device detail view once the hardware is repaired or opened.
                  </p>
                </div>
              )}


              <div className="grid gap-4 rounded-xl border border-slate-200/40 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-2xs">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
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

              <div className="grid gap-4 rounded-xl border border-slate-200/40 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-2xs">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
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
                  className="h-10 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm text-slate-900 dark:text-zinc-50 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
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

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/40">
                <Button 
                  variant="outline" 
                  onClick={() => goToStep(1)} 
                  className="h-10 px-5 rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer font-medium"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Step 1
                  </span>
                </Button>
                <Button 
                  onClick={() => goToStep(3)} 
                  className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors cursor-pointer font-medium"
                >
                  <span className="flex items-center gap-2">
                    Next: Repair Job Details
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </div>
            </>
          )}
        </section>
      ) : currentStep === 3 ? (
        <section className="space-y-6 bg-slate-50/20 dark:bg-zinc-900/10 p-6 rounded-xl border border-slate-100 dark:border-zinc-800/40">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">Step 3: Repair Job Details</h2>

          <div className="grid gap-4 rounded-xl border border-slate-200/40 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
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

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/40">
            <Button 
              variant="outline" 
              onClick={() => goToStep(2)} 
              className="h-10 px-5 rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer font-medium"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Step 2
              </span>
            </Button>

            <Button 
              onClick={handleGoToStep4} 
              className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors cursor-pointer font-medium"
            >
              <span className="flex items-center gap-2">
                Next: Review and Submit
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>

          {inputPreviewError ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {inputPreviewError}
            </p>
          ) : null}

          {inputPreview ? (
            <pre className="overflow-x-auto rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-xs text-slate-800 dark:text-zinc-300 shadow-xs">
              {inputPreview}
            </pre>
          ) : null}
        </section>
      ) : (
        <section className="space-y-6 bg-slate-50/20 dark:bg-zinc-900/10 p-6 rounded-xl border border-slate-100 dark:border-zinc-800/40">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">Step 4: Confirmation</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Review the built input, then create the service order.
          </p>

          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
            Service Order Summary
          </h3>

          {inputPreview ? (
            <pre className="overflow-x-auto rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-xs text-slate-800 dark:text-zinc-300 shadow-xs">
              {inputPreview}
            </pre>
          ) : (
            <p className="rounded-md border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              Service order details are not ready yet. Go back to Step 3 and
              complete required fields.
            </p>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/40">
            <Button 
              variant="outline" 
              onClick={() => goToStep(3)} 
              className="h-10 px-5 rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer font-medium"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Step 3
              </span>
            </Button>
            <Button
              onClick={handleSubmitServiceOrder}
              disabled={isSubmittingServiceOrder}
              className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors cursor-pointer font-medium"
            >
              {isSubmittingServiceOrder ? (
                "Creating Service Order..."
              ) : (
                <span className="flex items-center gap-2">
                  Create Service Order
                  <Check className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>

          {submitError ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          ) : null}
        </section>
      )}
    </section>
  );
};

export default CreateServiceOrder;
