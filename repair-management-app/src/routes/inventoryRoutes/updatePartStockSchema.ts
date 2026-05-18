import { z } from "zod";

export const updatePartStockSchema = z.object({
  newQuantity: z
    .number({ message: "New quantity is required" })
    .min(0, "New quantity must be a positive number"),
  reason: z
    .string()
    .trim()
    .max(300, "Reason must be less than 300 characters")
    .nullable(),
});

export type UpdatePartStockFormData = z.infer<typeof updatePartStockSchema>;
