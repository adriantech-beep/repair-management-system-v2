import { z } from "zod";

export const managePartCompatibilitySchema = z.object({
  brand: z
    .string()
    .trim()
    .min(2, "Brand is required")
    .max(60, "Brand must be less than 60 characters"),
  modelName: z
    .string()
    .trim()
    .min(1, "Model name is required")
    .max(80, "Model name must be less than 80 characters"),
});

export type ManagePartCompatibilityFormData = z.infer<
  typeof managePartCompatibilitySchema
>;
