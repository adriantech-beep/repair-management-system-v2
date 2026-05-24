import { z } from "zod";

export const updateRepairSchema = z.object({
  problemDescription: z
    .string()
    .min(5, "Problem description must not be less than 5 characters")
    .max(1000),
  diagnosisNotes: z.string().max(1000).nullable(),
  resolutionNotes: z.string().max(1000).nullable(),
  estimatedCost: z.number().nullable(),
  finalCost: z.number().nullable(),
});

export type UpdateRepairFormData = z.infer<typeof updateRepairSchema>;
