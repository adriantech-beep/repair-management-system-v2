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
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
