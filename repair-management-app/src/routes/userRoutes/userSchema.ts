import { z } from "zod";

export const userSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/,
      "Password must contain at least one uppercase, one lowercase, one digit, and one special character."
    ),
  role: z.enum(["Admin", "Technician"], {
    message: "Please select a valid role.",
  }),
  branchId: z.string().min(1, "Please select a branch."),
});

export type UserFormData = z.infer<typeof userSchema>;
