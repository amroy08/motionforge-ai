import { z } from "zod";
import { mediaConfig } from "@/config/media";

/**
 * Validate prepare image metadata parameters
 */
export const prepareImageUploadSchema = z.object({
  originalFilename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename is too long")
    .transform((val) => {
      // Strip directory symbols, backslashes, control characters
      return val.replace(/[\/\\]/g, "").replace(/[\x00-\x1F\x7F]/g, "").trim();
    }),
  mimeType: z.string().refine((val) => (mediaConfig.allowedImageMimeTypes as readonly string[]).includes(val), {
    message: "Unsupported file format. Please upload JPEG, PNG, or WebP.",
  }),
  sizeBytes: z
    .number()
    .int()
    .min(1, "File cannot be empty")
    .max(mediaConfig.maxImageBytes, `File size exceeds the limit of 6 MB.`),
});

/**
 * Validate complete image parameters
 */
export const completeImageUploadSchema = z.object({
  temporaryPath: z
    .string()
    .min(1)
    .refine((val) => !val.includes("..") && val.startsWith("users/"), {
      message: "Invalid storage path target",
    }),
  originalFilename: z
    .string()
    .min(1)
    .max(255)
    .transform((val) => val.replace(/[\/\\]/g, "").trim()),
});

/**
 * Validate asset removal request
 */
export const removeImageInputSchema = z.object({
  assetId: z.string().uuid("Invalid asset identifier"),
});

/**
 * Validate signed preview url request
 */
export const signedPreviewSchema = z.object({
  assetId: z.string().uuid("Invalid asset identifier"),
});
