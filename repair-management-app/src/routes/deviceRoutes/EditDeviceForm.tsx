import { FormProvider, useForm } from "react-hook-form";
import { deviceSchema, type DeviceFormData } from "./deviceSchema";
import CreateDeviceFields from "./CreateDeviceFields";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetDeviceById, useUpdateDevice } from "@/hooks/useDevices";
import { useEffect } from "react";
import parseApiError from "@/api/parseApiError";

type EditDeviceFormProps = {
  deviceId: string;
  onCloseModal?: () => void;
};

const EditDeviceForm = ({ deviceId, onCloseModal }: EditDeviceFormProps) => {
  const {
    data: device,
    isLoading,
    isError,
    error,
  } = useGetDeviceById(deviceId);
  const { mutateAsync: updateDevice } = useUpdateDevice();

  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      brand: "",
      model: "",
      imeiOrSerialNumber: null,
      deviceType: undefined,
    },
  });

  const onSubmit = async (data: DeviceFormData) => {
    try {
      form.clearErrors("root");

      if (!device) return;

      await updateDevice({
        deviceId,
        customerId: device.customerId,
        payload: {
          brand: data.brand.trim(),
          model: data.model.trim(),
          imeiOrSerialNumber: data.imeiOrSerialNumber?.trim() || null,
          deviceType: data.deviceType,
        },
      });

      onCloseModal?.();
    } catch (error) {
      const parsed = parseApiError(error);

      if (parsed.fieldErrors) {
        for (const [fieldName, messages] of Object.entries(
          parsed.fieldErrors,
        )) {
          const normalized = fieldName.toLowerCase();
          const firstMessage = messages[0];
          if (!firstMessage) continue;

          if (normalized === "brand") {
            form.setError("brand", { message: firstMessage });
          } else if (normalized === "model") {
            form.setError("model", { message: firstMessage });
          } else if (
            normalized === "serialnumber" ||
            normalized === "imeiorserialnumber"
          ) {
            form.setError("imeiOrSerialNumber", { message: firstMessage });
          } else if (normalized === "devicetype") {
            form.setError("deviceType", { message: firstMessage });
          }
        }
      }

      if (parsed.status === 409) {
        form.setError("imeiOrSerialNumber", {
          message: "IMEI / Serial number already exists in this branch.",
        });
      }

      const isNetworkFailure = !parsed.status && !parsed.message;

      form.setError("root", {
        message: isNetworkFailure
          ? "Cannot reach the server..."
          : (parsed.message ?? "Unable to update device."),
      });
    }
  };

  useEffect(() => {
    if (!device) return;
    form.reset({
      brand: device.brand,
      model: device.model,
      imeiOrSerialNumber: device.imeiOrSerialNumber,
      deviceType: device.deviceType,
    });
  }, [device, form]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-white p-4 text-sm text-emerald-900/70 shadow-sm">
        Loading device details...
      </div>
    );
  }

  const parsedLoadError = isError ? parseApiError(error) : null;

  const loadErrorMessage =
    parsedLoadError?.status === 404
      ? "Device not found."
      : parsedLoadError?.status === 403
        ? "You do not have permission to view this device."
        : "Unable to load device details.";

  if (isError || !device) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
        {loadErrorMessage}
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-emerald-950">
        Edit Device
      </h3>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CreateDeviceFields />

          {form.formState.errors.root?.message ? (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={onCloseModal}>
              Cancel
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default EditDeviceForm;
