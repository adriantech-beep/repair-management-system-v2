import { z } from "zod";

export const updateRepairSchema = z.object({
  problemDescription: z
    .string()
    .min(5, "Problem description must be at least 5 characters")
    .max(1000),
  diagnosisNotes: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().max(1000).nullable()
  ),
  resolutionNotes: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().max(1000).nullable()
  ),
  estimatedCost: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number()
      .min(0, "Estimated cost must be a non-negative number")
      .max(999999.99, "Estimated cost cannot exceed 999,999.99")
      .nullable()
  ),
  finalCost: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number()
      .min(0, "Final cost must be a non-negative number")
      .max(999999.99, "Final cost cannot exceed 999,999.99")
      .nullable()
  ),
});

export type UpdateRepairFormData = {
  problemDescription: string;
  diagnosisNotes: string | null;
  resolutionNotes: string | null;
  estimatedCost: number | string | null;
  finalCost: number | string | null;
};

