import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { customerSchema, type CustomerFormData } from "./customerSchema";
import { useCreateCustomer } from "@/hooks/useCustomers";
import parseApiError from "@/api/parseApiError";
import useAuthStore from "@/store/authStore";
import CreateCustomerFields from "./CreateCustomerFields";
import CustomerList from "./CustomerList";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { mutateAsync: createCustomer } = useCreateCustomer();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      form.clearErrors("root");

      if (!user?.branchId) {
        form.setError("root", {
          message: "Missing branch context. Please sign in again.",
        });
        return;
      }

      await createCustomer({
        ...data,
        email: data.email === "" ? null : data.email,
        address: data.address === "" ? null : data.address,
        branchId: user.branchId,
      });
      //   console.log(data, { branchId: user.branchId });

      navigate("/customers", { replace: true });
    } catch (error) {
      const parsed = parseApiError(error);

      if (parsed.fieldErrors) {
        for (const [fieldName, messages] of Object.entries(
          parsed.fieldErrors,
        )) {
          const normalized = fieldName.toLowerCase();
          const firstMessage = messages[0];
          if (!firstMessage) continue;

          if (normalized === "fullname") {
            form.setError("fullName", { message: firstMessage });
          } else if (normalized === "phone") {
            form.setError("phone", { message: firstMessage });
          } else if (normalized === "email") {
            form.setError("email", { message: firstMessage });
          } else if (normalized === "address") {
            form.setError("address", { message: firstMessage });
          }
        }
      }

      if (parsed.status === 409) {
        form.setError("phone", {
          message: "Phone already exists in this branch.",
        });
      }

      form.setError("root", {
        message: parsed.message ?? "Unable to create customer.",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <CustomerList />
      <h1 className="text-2xl font-semibold">Create Customer</h1>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CreateCustomerFields />

          {form.formState.errors.root?.message ? (
            <p className="text-sm text-red-600">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Customer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/customers")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateCustomer;
