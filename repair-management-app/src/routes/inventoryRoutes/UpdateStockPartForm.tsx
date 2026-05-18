import parseApiError from "@/api/parseApiError";
import { Button } from "@/components/ui/button";
import { useUpdatePartStock } from "@/hooks/useInventory";
import type { PartResponse } from "@/types/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  updatePartStockSchema,
  type UpdatePartStockFormData,
} from "./updatePartStockSchema";
import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type UpdateStockPartFormProps = {
  part: PartResponse;
  onCloseModal?: () => void;
};

const UpdateStockPartForm = ({
  part,
  onCloseModal,
}: UpdateStockPartFormProps) => {
  const { mutateAsync: updatePartStock } = useUpdatePartStock(part.id);
  const [quantityInput, setQuantityInput] = useState(
    String(part.stockQuantity),
  );

  const form = useForm<UpdatePartStockFormData>({
    resolver: zodResolver(updatePartStockSchema),
    defaultValues: {
      newQuantity: part.stockQuantity,
      reason: null,
    },
  });

  const onSubmit = async (data: UpdatePartStockFormData) => {
    try {
      form.clearErrors("root");

      await updatePartStock({
        newQuantity: data.newQuantity,
        reason: data.reason,
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

          if (normalized === "newquantity") {
            form.setError("newQuantity", { message: firstMessage });
          } else if (normalized === "reason") {
            form.setError("reason", { message: firstMessage });
          }
        }
      }

      form.setError("root", {
        message: parsed.message ?? "Unable to update stock.",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
        <header className="space-y-1">
          <h3 className="text-lg font-semibold text-emerald-950">
            Update Stock
          </h3>
          <p className="text-sm text-emerald-900/70">
            {part.name} ({part.partNumber})
          </p>
        </header>

        <FormField
          control={form.control}
          name="newQuantity"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-emerald-950/80">
                New Quantity
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="h-10 rounded-lg border-emerald-900/20 bg-white text-sm text-emerald-950 placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200"
                  value={quantityInput}
                  onChange={(event) => {
                    const rawValue = event.target.value;
                    setQuantityInput(rawValue);

                    if (rawValue === "") {
                      field.onChange(undefined);
                      return;
                    }

                    const parsedNumber = Number(rawValue);
                    field.onChange(
                      Number.isNaN(parsedNumber) ? undefined : parsedNumber,
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-emerald-950/80">
                Reason (optional)
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Reason for stock update"
                  className="h-10 rounded-lg border-emerald-900/20 bg-white text-sm text-emerald-950 placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const nextValue = event.target.value.trim();
                    field.onChange(
                      nextValue.length === 0 ? null : event.target.value,
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Stock"}
          </Button>
          <Button type="button" variant="outline" onClick={onCloseModal}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateStockPartForm;
