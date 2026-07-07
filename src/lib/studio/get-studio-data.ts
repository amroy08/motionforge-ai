import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/supabase/auth";
import { createPreviewUrl } from "@/lib/media/create-preview-url";
import { mapStudioError } from "./errors";
import type { StudioDataResult, StudioModel, StudioSourceAsset } from "./types";

const VALID_ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4"];

// Strict Zod schema for model validations
const modelDbSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  generation_type: z.literal("image_to_video"),
  base_credit_cost: z.number().nonnegative(),
  credit_cost_per_second: z.number().nonnegative(),
  supported_durations: z.array(z.number().int().positive()).min(1),
  supported_aspect_ratios: z.array(z.string().refine((r) => VALID_ASPECT_RATIOS.includes(r))).min(1),
  supports_negative_prompt: z.boolean(),
  is_featured: z.boolean(),
  supports_image_input: z.literal(true),
  supports_text_input: z.literal(true),
});

/**
 * Server-only bootstrap data fetcher for the AI Studio.
 * Securely query wallet, active models, and recent assets using user authentication.
 */
export async function getStudioData(): Promise<StudioDataResult> {
  try {
    const profile = await requireActiveUser();
    const supabase = await createClient();

    // 1. Fetch wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", profile.id)
      .single();

    if (walletError || !wallet) {
      return {
        status: "configuration_error",
        code: "wallet_missing",
        message: "Your credit wallet is not available. Please complete database setup.",
      };
    }

    // 2. Query active image-to-video models
    const { data: dbModels, error: modelsError } = await supabase
      .from("ai_models")
      .select("*")
      .eq("is_active", true)
      .eq("generation_type", "image_to_video")
      .eq("supports_image_input", true)
      .eq("supports_text_input", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    if (modelsError) {
      const mapped = mapStudioError(modelsError);
      return {
        status: "configuration_error",
        code: mapped.category,
        message: mapped.message,
      };
    }

    const validatedModels: StudioModel[] = [];

    // Parse each model separately to prevent a single corrupt configuration from breaking the app
    if (dbModels) {
      for (const row of dbModels) {
        try {
          const parsed = modelDbSchema.parse(row);
          // Sort durations ascending
          const sortedDurations = [...parsed.supported_durations].sort((a, b) => a - b);
          
          validatedModels.push({
            id: parsed.id,
            name: parsed.name,
            slug: parsed.slug,
            description: parsed.description,
            generationType: "image_to_video",
            baseCreditCost: parsed.base_credit_cost.toString(),
            creditCostPerSecond: parsed.credit_cost_per_second.toString(),
            supportedDurations: sortedDurations,
            supportedAspectRatios: parsed.supported_aspect_ratios,
            supportsNegativePrompt: parsed.supports_negative_prompt,
            featured: parsed.is_featured,
          });
        } catch {
          // Skip misconfigured models and output dev diagnostics
          console.warn(`[Studio Setup] Skipped invalid AI Model configuration for slug: ${row.slug}`);
        }
      }
    }

    // 3. Query newest 20 unlinked user inputs
    const { data: dbAssets, error: assetsError } = await supabase
      .from("media_assets")
      .select("id, original_filename, mime_type, file_size_bytes, width, height, created_at")
      .eq("user_id", profile.id)
      .eq("asset_type", "input_image")
      .is("generation_id", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20);

    if (assetsError) {
      const mapped = mapStudioError(assetsError);
      return {
        status: "configuration_error",
        code: mapped.category,
        message: mapped.message,
      };
    }

    const validatedAssets: StudioSourceAsset[] = [];

    if (dbAssets) {
      for (const row of dbAssets) {
        try {
          const previewUrl = await createPreviewUrl(row.id, profile.id);
          // Expires 10 minutes from now (600s)
          const previewExpiresAt = new Date(Date.now() + 600 * 1000).toISOString();

          validatedAssets.push({
            id: row.id,
            originalFilename: row.original_filename,
            mimeType: row.mime_type || "image/jpeg",
            fileSizeBytes: Number(row.file_size_bytes),
            width: Number(row.width),
            height: Number(row.height),
            previewUrl,
            previewExpiresAt,
            createdAt: row.created_at,
          });
        } catch {
          // If signed URL generation fails, ignore this asset row
          console.warn(`[Studio Setup] Skipped media asset due to signed url generation failure: ${row.id}`);
        }
      }
    }

    return {
      status: "ready",
      walletBalance: wallet.balance.toString(),
      models: validatedModels,
      assets: validatedAssets,
    };

  } catch (err) {
    const mapped = mapStudioError(err);
    return {
      status: "configuration_error",
      code: mapped.category,
      message: mapped.message,
    };
  }
}
