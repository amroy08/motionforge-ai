import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createPreviewUrl } from "./create-preview-url";

export interface UserInputAsset {
  id: string;
  originalFilename: string | null;
  mimeType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  previewUrl: string;
  createdAt: string;
}

export interface UserInputAssetsResult {
  assets: UserInputAsset[];
  error?: string;
}

/**
 * Fetches up to 20 of the user's uploaded input image assets.
 * Excludes soft-deleted records and orders newest first.
 * Secure: generates temporary signed URLs on the server.
 */
export async function getUserInputAssets(userId: string): Promise<UserInputAssetsResult> {
  const supabase = await createClient();

  try {
    // 1. Query media assets database
    const { data: rows, error } = await supabase
      .from("media_assets")
      .select("id, original_filename, mime_type, file_size_bytes, width, height, created_at")
      .eq("user_id", userId)
      .eq("asset_type", "input_image")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      if (error.code === "42P01" || error.message?.includes("relation")) {
        return {
          assets: [],
          error: "Database schema tables are unconfigured.",
        };
      }
      return {
        assets: [],
        error: "Failed to query media asset records.",
      };
    }

    if (!rows || rows.length === 0) {
      return { assets: [] };
    }

    // 2. Generate signed URLs concurrently for all assets
    const assetsWithUrls = await Promise.all(
      rows.map(async (row) => {
        try {
          const previewUrl = await createPreviewUrl(row.id, userId);
          return {
            id: row.id,
            originalFilename: row.original_filename,
            mimeType: row.mime_type || "image/jpeg",
            fileSizeBytes: Number(row.file_size_bytes),
            width: Number(row.width),
            height: Number(row.height),
            previewUrl,
            createdAt: row.created_at,
          };
        } catch {
          // If signed URL fails, return with empty preview string rather than crashing
          return {
            id: row.id,
            originalFilename: row.original_filename,
            mimeType: row.mime_type || "image/jpeg",
            fileSizeBytes: Number(row.file_size_bytes),
            width: Number(row.width),
            height: Number(row.height),
            previewUrl: "",
            createdAt: row.created_at,
          };
        }
      })
    );

    return {
      assets: assetsWithUrls.filter((asset) => asset.previewUrl !== ""),
    };

  } catch {
    return {
      assets: [],
      error: "A database error occurred. Please try again later.",
    };
  }
}
