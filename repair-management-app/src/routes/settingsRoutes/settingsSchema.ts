import * as z from "zod";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const logoSchema = z
    .instanceof(File, {
        message: "Please select an image file",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
    );

export const settingsSchema = z.object({
    companyName: z
        .string()
        .trim()
        .min(2, "Company name must be at least 2 characters")
        .max(100, "Company name must be less than 100 characters"),
    logoFile: logoSchema.optional(),
    contactNumber: z
        .string()
        .trim()
        .max(50, "Contact number must be less than 50 characters")
        .nullable()
        .optional(),
    website: z
        .string()
        .trim()
        .max(150, "Website must be less than 150 characters")
        .url("Must be a valid URL")
        .or(z.literal(""))
        .nullable()
        .optional(),
    businessNumber: z
        .string()
        .trim()
        .max(100, "Business number must be less than 100 characters")
        .nullable()
        .optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
