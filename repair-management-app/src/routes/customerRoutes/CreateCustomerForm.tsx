import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateCustomer } from "@/hooks/useCustomers";
import parseApiError from "@/api/parseApiError";
import useAuthStore from "@/store/authStore";
import { customerSchema, type CustomerFormData } from "./customerSchema";
import CustomersTable from "./CustomersTable";
import CreateCustomerFields from "./CreateCustomerFields";

const CreateCustomerForm = () => {
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
    <div className="mx-auto w-full max-w-6xl space-y-6 p-3 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
          Customer Management
        </h1>
        <p className="text-sm text-emerald-900/60">
          Search customers and register new entries for your branch.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <CustomersTable />

        <section className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-1 text-lg font-semibold text-emerald-950">
            Create Customer
          </h2>
          <p className="mb-5 text-sm text-emerald-900/60">
            Fill out the basic customer profile details below.
          </p>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CreateCustomerFields />

              {form.formState.errors.root?.message ? (
                <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {form.formState.errors.root.message}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Creating..."
                    : "Create Customer"}
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
        </section>
      </div>
    </div>
  );
};

export default CreateCustomerForm;
