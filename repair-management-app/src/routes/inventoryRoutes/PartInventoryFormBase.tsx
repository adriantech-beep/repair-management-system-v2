import parseApiError from "@/api/parseApiError";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import CreatePartInventoryFields from "./CreatePartInventoryFields";
import {
  createPartInventorySchema,
  type CreatePartInventoryFormData,
} from "./createPartInventorySchema";

type PartInventoryFormBaseProps = {
  mode: "create" | "edit";
  initialValues?: Partial<CreatePartInventoryFormData>;
  submitLabel?: string;
  onSubmitForm: (data: CreatePartInventoryFormData) => Promise<unknown>;
  onCloseModal?: () => void;
};

const EMPTY_DEFAULTS: Partial<CreatePartInventoryFormData> = {
  partNumber: "",
  name: "",
  category: "",
  stockQuantity: undefined,
  supplierPrice: undefined,
  sellingPrice: undefined,
};

function setFieldErrors(
  setError: ReturnType<typeof useForm<CreatePartInventoryFormData>>["setError"],
  fieldErrors: Record<string, string[]>,
) {
  for (const [fieldName, messages] of Object.entries(fieldErrors)) {
    const normalized = fieldName.toLowerCase();
    const firstMessage = messages[0];
    if (!firstMessage) continue;

    if (normalized === "partnumber") {
      setError("partNumber", { message: firstMessage });
    } else if (normalized === "name") {
      setError("name", { message: firstMessage });
    } else if (normalized === "category") {
      setError("category", { message: firstMessage });
    } else if (normalized === "stockquantity") {
      setError("stockQuantity", { message: firstMessage });
    } else if (normalized === "supplierprice") {
      setError("supplierPrice", { message: firstMessage });
    } else if (normalized === "sellingprice") {
      setError("sellingPrice", { message: firstMessage });
    }
  }
}

const PartInventoryFormBase = ({
  mode,
  initialValues,
  submitLabel,
  onSubmitForm,
  onCloseModal,
}: PartInventoryFormBaseProps) => {
  const form = useForm<CreatePartInventoryFormData>({
    resolver: zodResolver(createPartInventorySchema),
    defaultValues: initialValues ?? EMPTY_DEFAULTS,
  });

  const onSubmit = async (data: CreatePartInventoryFormData) => {
    try {
      form.clearErrors("root");
      await onSubmitForm(data);
      onCloseModal?.();
    } catch (error) {
      const parsed = parseApiError(error);

      if (parsed.fieldErrors) {
        setFieldErrors(form.setError, parsed.fieldErrors);
      }

      if (parsed.status === 409) {
        form.setError("partNumber", {
          message: "Part number already exists.",
        });
      }

      form.setError("root", {
        message:
          parsed.message ??
          (mode === "create"
            ? "Unable to create part."
            : "Unable to update part."),
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
        <CreatePartInventoryFields />

        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : (submitLabel ??
                (mode === "create" ? "Create Part" : "Update Part"))}
          </Button>
          <Button type="button" variant="outline" onClick={onCloseModal}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default PartInventoryFormBase;
