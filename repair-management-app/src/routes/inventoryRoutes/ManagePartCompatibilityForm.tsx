import parseApiError from "@/api/parseApiError";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useAddPartCompatibility,
  useRemovePartCompatibility,
} from "@/hooks/useInventory";
import type { PartCompatibility, PartResponse } from "@/types/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";
import {
  managePartCompatibilitySchema,
  type ManagePartCompatibilityFormData,
} from "./managePartCompatibilitySchema";

type ManagePartCompatibilityFormProps = {
  part: PartResponse;
  onCloseModal?: () => void;
};

const ManagePartCompatibilityForm = ({
  part,
  onCloseModal,
}: ManagePartCompatibilityFormProps) => {
  const { mutateAsync: addCompatibility } = useAddPartCompatibility(part.id);

  const { mutateAsync: removeCompatibility } = useRemovePartCompatibility(
    part.id,
  );
  const [compatibilities, setCompatibilities] = useState<PartCompatibility[]>(
    part.compatibilities,
  );
  const [removingId, setRemovingId] = useState<string | null>(null);

  const form = useForm<ManagePartCompatibilityFormData>({
    resolver: zodResolver(managePartCompatibilitySchema),
    defaultValues: {
      brand: "",
      modelName: "",
    },
  });

  const onSubmit = async (data: ManagePartCompatibilityFormData) => {
    try {
      form.clearErrors("root");

      const normalizedBrand = data.brand.trim().toLowerCase();
      const normalizedModel = data.modelName.trim().toLowerCase();
      const alreadyExists = compatibilities.some(
        (compatibility) =>
          compatibility.brand.trim().toLowerCase() === normalizedBrand &&
          compatibility.modelName.trim().toLowerCase() === normalizedModel,
      );

      if (alreadyExists) {
        form.setError("root", {
          message: "This compatibility already exists for this part.",
        });
        return;
      }

      const created = await addCompatibility({
        brand: data.brand.trim(),
        modelName: data.modelName.trim(),
      });

      setCompatibilities((prev) => [...prev, created]);
      form.reset({ brand: "", modelName: "" });
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
          } else if (normalized === "modelname") {
            form.setError("modelName", { message: firstMessage });
          }
        }
      }

      if (parsed.status === 409) {
        form.setError("root", {
          message: "This compatibility already exists for this part.",
        });
        return;
      }

      if (
        parsed.status === 500 &&
        /duplicate|unique|compatibility/i.test(parsed.message)
      ) {
        form.setError("root", {
          message: "This compatibility already exists for this part.",
        });
        return;
      }

      form.setError("root", {
        message: parsed.message ?? "Unable to add compatibility.",
      });
    }
  };

  const handleRemove = async (compatibilityId: string) => {
    try {
      form.clearErrors("root");
      setRemovingId(compatibilityId);
      await removeCompatibility(compatibilityId);
      setCompatibilities((prev) =>
        prev.filter((compatibility) => compatibility.id !== compatibilityId),
      );
    } catch (error) {
      const parsed = parseApiError(error);
      form.setError("root", {
        message: parsed.message ?? "Unable to remove compatibility.",
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
        <header className="space-y-1">
          <h3 className="text-lg font-semibold text-emerald-950">
            Manage Compatibility
          </h3>
          <p className="text-sm text-emerald-900/70">
            {part.name} ({part.partNumber})
          </p>
        </header>

        <div className="space-y-3 rounded-lg border border-emerald-100/80 bg-white p-3">
          <h4 className="text-sm font-medium text-emerald-950">
            Current Compatibility
          </h4>

          {compatibilities.length === 0 ? (
            <p className="text-sm text-emerald-900/70">
              No compatibility entries yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {compatibilities.map((compatibility) => (
                <li
                  key={compatibility.id}
                  className="flex items-center justify-between rounded-md border border-emerald-100 px-3 py-2"
                >
                  <span className="text-sm text-emerald-950">
                    {compatibility.brand} - {compatibility.modelName}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={removingId === compatibility.id}
                    onClick={() => handleRemove(compatibility.id)}
                  >
                    {removingId === compatibility.id ? "Removing..." : "Remove"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-emerald-100/80 bg-white p-3">
          <h4 className="text-sm font-medium text-emerald-950">
            Add Compatibility
          </h4>

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium text-emerald-950/80">
                  Brand
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="e.g. Samsung"
                    className="h-10 rounded-lg border-emerald-900/20 bg-white text-sm text-emerald-950 placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium text-emerald-950/80">
                  Model Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="e.g. Galaxy S24"
                    className="h-10 rounded-lg border-emerald-900/20 bg-white text-sm text-emerald-950 placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add Compatibility"}
          </Button>
          <Button type="button" variant="outline" onClick={onCloseModal}>
            Close
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ManagePartCompatibilityForm;
