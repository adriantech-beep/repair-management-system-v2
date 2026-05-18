import { z } from "zod";

export const createPartInventorySchema = z.object({
  partNumber: z
    .string()
    .min(1, "Part number is required")
    .max(50, "Part number must be less than 50 characters"),
  name: z
    .string()
    .min(1, "Part name is required")
    .max(120, "Part name must be less than 120 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(60, "Category must be less than 60 characters"),
  stockQuantity: z
    .number({ message: "Stock quantity is required" })
    .min(0, "Stock quantity must be a positive number"),
  supplierPrice: z
    .number({ message: "Supplier price is required" })
    .min(0, "Supplier price must be a positive number"),
  sellingPrice: z
    .number({ message: "Selling price is required" })
    .min(0, "Selling price must be a positive number"),
});

export type CreatePartInventoryFormData = z.infer<
  typeof createPartInventorySchema
>;
