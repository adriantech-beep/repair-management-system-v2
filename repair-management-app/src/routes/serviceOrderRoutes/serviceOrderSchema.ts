import { z } from "zod";

const optionalTrimmedText = () =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length === 0
        ? null
        : typeof value === "string"
          ? value.trim()
          : value,
    z.string().nullable(),
  );

export const createRepairJobRequestSchema = z.object({
  customerId: z.string().uuid("Customer ID must be a valid UUID"),
  deviceId: z.string().uuid("Device ID must be a valid UUID"),
  branchId: z.string().uuid("Branch ID must be a valid UUID"),
  problemDescription: z
    .string()
    .min(5, "Problem description must be at least 5 characters")
    .max(1000, "Problem description cannot exceed 1000 characters"),
  estimatedCost: z
    .number()
    .min(0, "Estimated cost must be non-negative")
    .max(999999.99, "Estimated cost cannot exceed 999,999.99")
    .optional()
    .nullable(),
});

const serviceOrderRepairDetailsSchema = z.object({
  problemDescription: z
    .string()
    .min(5, "Problem description must be at least 5 characters")
    .max(1000, "Problem description cannot exceed 1000 characters"),
  estimatedCost: z
    .number()
    .min(0, "Estimated cost must be non-negative")
    .max(999999.99, "Estimated cost cannot exceed 999,999.99")
    .nullable(),
});

const serviceOrderCustomerIntakeSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name must be less than 100 characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must be less than 20 characters"),
  email: optionalTrimmedText()
    .refine((value) => value === null || z.email().safeParse(value).success, {
      message: "Invalid email address",
    })
    .refine((value) => value === null || value.length <= 265, {
      message: "Email must be less than 265 characters",
    }),
  address: optionalTrimmedText().refine(
    (value) => value === null || value.length <= 300,
    {
      message: "Address must be less than 300 characters",
    },
  ),
});

const serviceOrderDeviceIntakeSchema = z.object({
  brand: z
    .string()
    .trim()
    .min(1, "Brand is required")
    .max(50, "Brand must be at most 50 characters"),
  model: z
    .string()
    .trim()
    .min(1, "Model is required")
    .max(100, "Model must be at most 100 characters"),
  imeiOrSerialNumber: optionalTrimmedText().refine(
    (value) => value === null || value.length <= 100,
    {
      message: "IMEI / Serial number must be at most 100 characters",
    },
  ),
  deviceType: z.enum(["Mobile", "Laptop", "Tablet", "Desktop", "Other"]),
});

export const serviceOrderCreateInputSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("existing-record"),
    customerId: z.string().uuid("Customer ID must be a valid UUID"),
    deviceId: z.string().uuid("Device ID must be a valid UUID"),
    repairDetails: serviceOrderRepairDetailsSchema,
  }),
  z.object({
    mode: z.literal("new-intake"),
    customer: serviceOrderCustomerIntakeSchema,
    device: serviceOrderDeviceIntakeSchema,
    repairDetails: serviceOrderRepairDetailsSchema,
  }),
]);
