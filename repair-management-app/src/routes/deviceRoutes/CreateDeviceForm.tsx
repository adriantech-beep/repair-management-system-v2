import { FormProvider, useForm } from "react-hook-form";
import { deviceSchema, type DeviceFormData } from "./deviceSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "@/store/authStore";
import { useCreateDevice } from "@/hooks/useDevices";
import parseApiError from "@/api/parseApiError";
import CreateDeviceFields from "./CreateDeviceFields";
import { Button } from "@/components/ui/button";

type CreateDeviceFormProps = {
  customerId: string;
  onCloseModal?: () => void;
};

const CreateDeviceForm = ({
  customerId,
  onCloseModal,
}: CreateDeviceFormProps) => {
  const user = useAuthStore((state) => state.user);

  const { mutateAsync: createDevice } = useCreateDevice();

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

      if (!user?.branchId) {
        form.setError("root", {
          message: "Missing branch context. Please sign in again.",
        });
        return;
      }

      await createDevice({
        ...data,
        brand: data.brand.trim(),
        model: data.model.trim(),
        customerId,
        branchId: user.branchId,
        imeiOrSerialNumber: data.imeiOrSerialNumber?.trim() || null,
        deviceType: data.deviceType,
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

      form.setError("root", {
        message: parsed.message ?? "Unable to create device.",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-3 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
          Device Management
        </h1>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-1 text-lg font-semibold text-emerald-950">
            Create Device
          </h2>
          <p className="mb-5 text-sm text-emerald-900/60">
            Fill out the basic device details below.
          </p>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CreateDeviceFields />

              {form.formState.errors.root?.message ? (
                <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {form.formState.errors.root.message}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Creating..."
                    : "Create Device"}
                </Button>
                <Button type="button" variant="outline" onClick={onCloseModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </FormProvider>
        </section>
      </div>
    </div>
  );
};

export default CreateDeviceForm;
