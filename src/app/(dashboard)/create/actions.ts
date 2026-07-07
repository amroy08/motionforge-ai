"use server";

import { requireActiveUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { reviewSettingsSchema } from "@/lib/validations/generation";
import { calculateGenerationCreditCost } from "@/lib/studio/calculate-credit-cost";
import { createPreviewUrl } from "@/lib/media/create-preview-url";
import { mapStudioError } from "@/lib/studio/errors";

export type GenerationReviewResult =
  | {
      status: "idle";
    }
  | {
      status: "invalid";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | {
      status: "configuration_error";
      message: string;
    }
  | {
      status: "reviewed";
      review: {
        sourceAssetId: string;
        sourcePreviewUrl: string;
        modelId: string;
        modelName: string;
        prompt: string;
        negativePrompt: string | null;
        durationSeconds: number;
        aspectRatio: string;
        estimatedCredits: string;
        walletBalance: string;
        estimatedRemainingBalance: string;
        hasSufficientCredits: boolean;
      };
    };

/**
 * Server Action: Authoritatively validates Studio settings against active model features,
 * user asset ownership, and credit balance limits.
 * Safe: Bypasses no RLS, calls no external APIs, performs no database writes.
 */
export async function reviewGenerationSettingsAction(
  formData: FormData
): Promise<GenerationReviewResult> {
  try {
    // 1. Authenticate caller
    const profile = await requireActiveUser();
    const supabase = await createClient();

    // 2. Parse fields
    const rawSourceAssetId = formData.get("sourceAssetId") as string;
    const rawModelId = formData.get("modelId") as string;
    const rawPrompt = formData.get("prompt") as string;
    const rawNegativePrompt = formData.get("negativePrompt") as string;
    const rawDurationSeconds = Number(formData.get("durationSeconds"));
    const rawAspectRatio = formData.get("aspectRatio") as string;

    const result = reviewSettingsSchema.safeParse({
      sourceAssetId: rawSourceAssetId,
      modelId: rawModelId,
      prompt: rawPrompt,
      negativePrompt: rawNegativePrompt,
      durationSeconds: rawDurationSeconds,
      aspectRatio: rawAspectRatio,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        status: "invalid",
        message: result.error.issues[0]?.message || "Invalid configuration parameters.",
        fieldErrors,
      };
    }

    const data = result.data;

    // 3. Query and validate image asset ownership
    const { data: assetRow, error: assetError } = await supabase
      .from("media_assets")
      .select("id, asset_type, user_id, deleted_at, generation_id")
      .eq("id", data.sourceAssetId)
      .eq("user_id", profile.id)
      .single();

    if (assetError || !assetRow) {
      return {
        status: "invalid",
        message: "Selected source image not found or access is restricted.",
      };
    }

    if (assetRow.asset_type !== "input_image") {
      return {
        status: "invalid",
        message: "Selected asset is not a valid input image.",
      };
    }

    if (assetRow.deleted_at !== null) {
      return {
        status: "invalid",
        message: "Selected source image has been deleted.",
      };
    }

    if (assetRow.generation_id !== null) {
      return {
        status: "invalid",
        message: "Selected image is already linked to a generated video.",
      };
    }

    // 4. Query and validate active AI model
    const { data: modelRow, error: modelError } = await supabase
      .from("ai_models")
      .select("id, name, base_credit_cost, credit_cost_per_second, supported_durations, supported_aspect_ratios, supports_negative_prompt, generation_type, supports_image_input, supports_text_input")
      .eq("id", data.modelId)
      .eq("is_active", true)
      .single();

    if (modelError || !modelRow) {
      return {
        status: "invalid",
        message: "Selected generation model is currently unavailable.",
      };
    }

    if (modelRow.generation_type !== "image_to_video") {
      return {
        status: "invalid",
        message: "Selected model does not support image-to-video generation.",
      };
    }

    if (!modelRow.supports_image_input || !modelRow.supports_text_input) {
      return {
        status: "invalid",
        message: "Selected model is incompatible with Studio inputs.",
      };
    }

    // 5. Check supported durations
    const supportedDurations = modelRow.supported_durations || [];
    if (!supportedDurations.includes(data.durationSeconds)) {
      return {
        status: "invalid",
        message: "Selected duration is unsupported by the selected model.",
      };
    }

    // 6. Check supported aspect ratios
    const supportedAspectRatios = modelRow.supported_aspect_ratios || [];
    if (!supportedAspectRatios.includes(data.aspectRatio)) {
      return {
        status: "invalid",
        message: "Selected aspect ratio is unsupported by the selected model.",
      };
    }

    // 7. Check negative prompt support
    const hasNegativePromptInput = data.negativePrompt && data.negativePrompt.trim().length > 0;
    if (hasNegativePromptInput && !modelRow.supports_negative_prompt) {
      return {
        status: "invalid",
        message: "Negative prompts are not supported by the selected model.",
      };
    }

    // 8. Fetch wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", profile.id)
      .single();

    if (walletError || !wallet) {
      return {
        status: "configuration_error",
        message: "Your credit wallet is missing. Complete setup before submitting.",
      };
    }

    // 9. Authoritative cost calculation
    const estimatedCredits = calculateGenerationCreditCost({
      baseCreditCost: modelRow.base_credit_cost,
      creditCostPerSecond: modelRow.credit_cost_per_second,
      durationSeconds: data.durationSeconds,
    });

    const balanceBig = BigInt(wallet.balance);
    const costBig = BigInt(estimatedCredits);
    const hasSufficientCredits = balanceBig >= costBig;
    const remainingBig = hasSufficientCredits ? balanceBig - costBig : BigInt(0);

    // 10. Generate refreshed preview URL
    const sourcePreviewUrl = await createPreviewUrl(assetRow.id, profile.id);

    return {
      status: "reviewed",
      review: {
        sourceAssetId: assetRow.id,
        sourcePreviewUrl,
        modelId: modelRow.id,
        modelName: modelRow.name,
        prompt: data.prompt,
        negativePrompt: data.negativePrompt || null,
        durationSeconds: data.durationSeconds,
        aspectRatio: data.aspectRatio,
        estimatedCredits,
        walletBalance: wallet.balance.toString(),
        estimatedRemainingBalance: remainingBig.toString(),
        hasSufficientCredits,
      },
    };

  } catch (err) {
    const mapped = mapStudioError(err);
    return {
      status: "configuration_error",
      message: mapped.message,
    };
  }
}
