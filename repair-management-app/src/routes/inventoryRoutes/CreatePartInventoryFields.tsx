import { useFormContext } from "react-hook-form";
import type { CreatePartInventoryFormData } from "./createPartInventorySchema";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type FieldConfig = {
  name: keyof CreatePartInventoryFormData;
  placeholder: string;
  type: string;
  parseAsNumber?: boolean;
  className: string;
};

const partInventoryFields: FieldConfig[] = [
  {
    name: "name",
    placeholder: "Part Name",
    type: "text",
    className: "sm:col-span-6",
  },
  {
    name: "partNumber",
    placeholder: "Part Number",
    type: "text",
    className: "sm:col-span-3",
  },
  {
    name: "category",
    placeholder: "Category",
    type: "text",
    className: "sm:col-span-3",
  },
  {
    name: "stockQuantity",
    placeholder: "Stock Quantity",
    type: "number",
    parseAsNumber: true,
    className: "sm:col-span-2",
  },
  {
    name: "supplierPrice",
    placeholder: "Supplier Price",
    type: "number",
    parseAsNumber: true,
    className: "sm:col-span-2",
  },
  {
    name: "sellingPrice",
    placeholder: "Selling Price",
    type: "number",
    parseAsNumber: true,
    className: "sm:col-span-2",
  },
];

const CreatePartInventoryFields = () => {
  const { control } = useFormContext<CreatePartInventoryFormData>();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
      {partInventoryFields.map(({ name, placeholder, type, parseAsNumber, className }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className={`space-y-1.5 ${className}`}>
              <FormLabel className="text-sm font-medium text-emerald-950/80">
                {placeholder}
              </FormLabel>
              <FormControl>
                <Input
                  type={type}
                  placeholder={placeholder}
                  className="h-10 rounded-lg border-emerald-900/20 bg-white text-sm text-emerald-950 placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    if (parseAsNumber) {
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : e.target.valueAsNumber,
                      );
                      return;
                    }

                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default CreatePartInventoryFields;
