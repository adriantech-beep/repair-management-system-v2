import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { CustomerFormData } from "./customerSchema";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

type FieldConfig = {
  name: keyof CustomerFormData;
  placeholder: string;
  type: string;
};

const customerInfoFields: FieldConfig[] = [
  {
    name: "fullName",
    placeholder: "Full Name",
    type: "text",
  },
  {
    name: "phone",
    placeholder: "Phone Number",
    type: "text",
  },
  {
    name: "email",
    placeholder: "Email",
    type: "email",
  },
  {
    name: "address",
    placeholder: "Address",
    type: "text",
  },
];

const CreateCustomerFields = () => {
  const { control } = useFormContext<CustomerFormData>();

  return (
    <div className="space-y-4">
      {customerInfoFields.map(({ name, placeholder, type }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-emerald-950/80">
                {placeholder}
              </FormLabel>
              <FormControl>
                <Input
                  type={type}
                  placeholder={placeholder}
                  className="h-11 rounded-xl border-emerald-900/15 bg-white/70 text-[15px] placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200"
                  {...field}
                  value={(field.value as string | undefined) ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
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

export default CreateCustomerFields;
