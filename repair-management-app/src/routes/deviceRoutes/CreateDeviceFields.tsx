import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DeviceFormData } from "./deviceSchema";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

type FieldConfig = {
  name: keyof DeviceFormData;
  placeholder: string;
  type: string;
};

const deviceInfoFields: FieldConfig[] = [
  {
    name: "brand",
    placeholder: "Brand",
    type: "text",
  },
  {
    name: "model",
    placeholder: "Model",
    type: "text",
  },
  {
    name: "imeiOrSerialNumber",
    placeholder: "IMEI / Serial Number",
    type: "text",
  },
];

const CreateDeviceFields = () => {
  const { control } = useFormContext<DeviceFormData>();
  return (
    <div className="space-y-4">
      {deviceInfoFields.map(({ name, placeholder, type }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-emerald-950/80">
                {placeholder}
              </FormLabel>
              <FormControl>
                <Input
                  type={type}
                  placeholder={placeholder}
                  className="h-10 rounded-lg border-emerald-900/20 bg-white text-sm text-emerald-950 placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200"
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

      <FormField
        control={control}
        name="deviceType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-emerald-950/80">
              Device Type
            </FormLabel>
            <FormControl>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CreateDeviceFields;
