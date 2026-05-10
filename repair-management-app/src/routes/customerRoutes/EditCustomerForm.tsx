import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { customerSchema, type CustomerFormData } from "./customerSchema";
import { useGetCustomerById, useUpdateCustomer } from "@/hooks/useCustomers";
import useAuthStore from "@/store/authStore";
import parseApiError from "@/api/parseApiError";
import CreateCustomerFields from "./CreateCustomerFields";
import DevicesByCustomerTable from "@/routes/deviceRoutes/DevicesByCustomerTable";

type EditCustomerFormProps = {
  customerId: string;
  onCloseModal?: () => void;
};

const EditCustomerForm = ({
  customerId,
  onCloseModal,
}: EditCustomerFormProps) => {
  const user = useAuthStore((state) => state.user);
  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useGetCustomerById(customerId);
  const { mutateAsync: updateCustomer } = useUpdateCustomer();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { fullName: "", phone: "", email: "", address: "" },
  });

  useEffect(() => {
    if (!customer) return;
    form.reset({
      fullName: customer.fullName ?? "",
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
    });
  }, [customer, form]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      form.clearErrors("root");

      if (!user?.branchId) {
        form.setError("root", {
          message: "Missing branch context. Please sign in again.",
        });
        return;
      }

      await updateCustomer({
        customerId,
        payload: {
          ...data,
          email: data.email === "" ? null : data.email,
          address: data.address === "" ? null : data.address,
          branchId: user.branchId,
        },
      });

      onCloseModal?.();
    } catch (error) {
      const parsed = parseApiError(error);

      if (parsed.fieldErrors) {
        for (const [fieldName, messages] of Object.entries(
          parsed.fieldErrors,
        )) {
          const firstMessage = messages?.[0];
          if (!firstMessage) continue;
          const normalized = fieldName.toLowerCase();

          if (normalized === "fullname")
            form.setError("fullName", { message: firstMessage });
          else if (normalized === "phone")
            form.setError("phone", { message: firstMessage });
          else if (normalized === "email")
            form.setError("email", { message: firstMessage });
          else if (normalized === "address")
            form.setError("address", { message: firstMessage });
        }
      }

      if (parsed.status === 409) {
        form.setError("phone", {
          message: "Phone already exists in this branch.",
        });
      }

      // Detect network failure (no status and no message)
      const isNetworkFailure = !parsed.status && !parsed.message;

      form.setError("root", {
        message: isNetworkFailure
          ? "Cannot reach the server..."
          : (parsed.message ?? "Unable to update customer."),
      });
    }
  };

  const parsedLoadError = isError ? parseApiError(error) : null;

  const loadErrorMessage =
    parsedLoadError?.status === 404
      ? "Customer not found."
      : parsedLoadError?.status === 403
        ? "You do not have permission to view this customer."
        : "Unable to load customer.";

  if (isError || !customer) {
    return <div className="p-6 text-red-600">{loadErrorMessage}</div>;
  }

  if (isLoading) return <div className="p-6">Loading customer...</div>;
  if (isError || !customer)
    return <div className="p-6 text-red-600">Unable to load customer.</div>;

  return (
    <div className="w-full max-w-6xl rounded-xl border border-emerald-100 bg-white p-6 shadow-xl">
      <div className="space-y-6">
        <section>
          <h3 className="mb-4 text-lg font-semibold text-emerald-950">
            Edit Customer
          </h3>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CreateCustomerFields />

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
        </section>

        <section className="space-y-3">
          <div>
            <h4 className="text-lg font-semibold text-emerald-950">
              Customer Devices
            </h4>
            <p className="text-sm text-emerald-900/60">
              Review and manage devices linked to this customer.
            </p>
          </div>

          <DevicesByCustomerTable customerId={customerId} />
        </section>
      </div>
    </div>
  );
};

export default EditCustomerForm;
