import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mediaConfig } from "@/config/media";

/**
 * Generates a short-lived signed preview URL for owned media assets.
 */
export async function createPreviewUrl(assetId: string, userId: string): Promise<string> {
  const supabase = await createClient();

  // 1. Fetch asset details while validating ownership
  const { data: asset, error: fetchError } = await supabase
    .from("media_assets")
    .select("storage_bucket, storage_path")
    .eq("id", assetId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (fetchError || !asset) {
    throw new Error("preview_failed");
  }

  // 2. Generate signed access token URL
  const { data, error: signError } = await supabase.storage
    .from(asset.storage_bucket)
    .createSignedUrl(asset.storage_path, mediaConfig.signedPreviewSeconds);

  if (signError || !data?.signedUrl) {
    throw new Error("preview_failed");
  }

  return data.signedUrl;
}
