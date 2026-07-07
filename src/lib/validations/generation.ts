import { z } from "zod";

const VALID_ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4"] as const;

/**
 * Zod validation schema for Phase 8 Studio Settings Review
 */
export const reviewSettingsSchema = z.object({
  sourceAssetId: z
    .string()
    .uuid("Invalid source image selection identifier."),
  modelId: z
    .string()
    .uuid("Invalid AI model selection identifier."),
  prompt: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.replace(/<[^>]*>/g, "").length >= 3, {
      message: "Prompt must contain at least 3 characters of instructions.",
    })
    .refine((val) => val.length <= 2000, {
      message: "Prompt exceeds the limit of 2,000 characters.",
    }),
  negativePrompt: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length <= 1000, {
      message: "Negative prompt exceeds the limit of 1,000 characters.",
    })
    .nullable()
    .or(z.literal("")),
  durationSeconds: z
    .number()
    .int("Duration must be a whole number of seconds.")
    .positive("Duration must be greater than zero."),
  aspectRatio: z
    .enum(VALID_ASPECT_RATIOS, {
      message: "Unsupported aspect ratio selection.",
    }),
});
