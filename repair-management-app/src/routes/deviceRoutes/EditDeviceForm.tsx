import { FormProvider, useForm } from "react-hook-form";
import { deviceSchema, type DeviceFormData } from "./deviceSchema";
import CreateDeviceFields from "./CreateDeviceFields";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetDeviceById, useUpdateDevice } from "@/hooks/useDevices";
import { useEffect } from "react";

type EditDeviceFormProps = {
  deviceId: string;
  onCloseModal?: () => void;
};

const EditDeviceForm = ({ deviceId, onCloseModal }: EditDeviceFormProps) => {
  const { data: device, isLoading, isError } = useGetDeviceById(deviceId);
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
    if (!device) return;

    await updateDevice({
      deviceId,
      customerId: device.customerId,
      payload: {
        brand: data.brand,
        model: data.model,
        imeiOrSerialNumber:
          data.imeiOrSerialNumber === "" ? null : data.imeiOrSerialNumber,
        deviceType: data.deviceType,
      },
    });

    onCloseModal?.();
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

  if (isError) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
        Unable to load device details.
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
