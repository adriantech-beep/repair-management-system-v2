import * as z from "zod";

export const customerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must be less than 20 characters"),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Invalid email address",
    })
    .refine((value) => value.length <= 265, {
      message: "Email must be less than 265 characters",
    }),
  address: z
    .string()
    .trim()
    .refine((value) => value.length <= 300, {
      message: "Address must be less than 300 characters",
    }),
  // branchId is sourced from auth context at submit time, not user input.
});

export type CustomerFormData = z.infer<typeof customerSchema>;
