import * as z from "zod";

export const deviceSchema = z.object({
  brand: z
    .string()
    .min(1, "Brand is required")
    .max(50, "Brand must be at most 50 characters"),
  model: z
    .string()
    .min(1, "Model is required")
    .max(100, "Model must be at most 100 characters"),
  imeiOrSerialNumber: z
    .string()
    .max(100, "IMEI / Serial number must be at most 100 characters")
    .nullable(),
  deviceType: z.enum(["Mobile", "Laptop", "Tablet", "Desktop", "Other"], {
    message: "Device type is required",
  }),
});

export type DeviceFormData = z.infer<typeof deviceSchema>;
