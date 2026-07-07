"use server";

import { requireActiveUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  prepareImageUploadSchema,
  completeImageUploadSchema,
  removeImageInputSchema,
} from "@/lib/validations/media";
import {
  createTemporaryImagePath,
  createFinalImagePath,
  isOwnedTemporaryImagePath,
} from "@/lib/media/storage-paths";
import { inspectImage } from "@/lib/media/inspect-image";
import { createPreviewUrl } from "@/lib/media/create-preview-url";
import { mapMediaError } from "@/lib/media/errors";
import { mediaConfig, mimeToExtension } from "@/config/media";
import type { AuthActionState } from "@/lib/auth/action-state";

export interface SafeAssetDetails {
  id: string;
  assetType: "input_image";
  originalFilename: string | null;
  mimeType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  previewUrl: string;
  previewExpiresAt: string;
}

export interface UploadActionState extends AuthActionState {
  data?: SafeAssetDetails;
  signedUrl?: string;
  token?: string;
  path?: string;
}

/**
 * Server Action: Prepare image upload by generating signed upload authorization.
 */
export async function prepareImageUploadAction(
  formData: FormData
): Promise<UploadActionState> {
  try {
    // 1. Authorize user
    const profile = await requireActiveUser();

    // 2. Validate input metadata
    const rawFilename = formData.get("originalFilename") as string;
    const rawMimeType = formData.get("mimeType") as string;
    const rawSizeBytes = Number(formData.get("sizeBytes"));

    const result = prepareImageUploadSchema.safeParse({
      originalFilename: rawFilename,
      mimeType: rawMimeType,
      sizeBytes: rawSizeBytes,
    });

    if (!result.success) {
      return {
        status: "error",
        message: result.error.issues[0]?.message || "Invalid upload parameters.",
      };
    }

    const { mimeType } = result.data;
    const extension = mimeToExtension(mimeType);
    if (!extension) {
      return {
        status: "error",
        message: "Unsupported file format. Please upload JPEG, PNG, or WebP.",
      };
    }

    // 3. Generate private owner-isolated temporary path
    const temporaryPath = createTemporaryImagePath(profile.id, extension);

    // 4. Create signed upload authorization using the admin client
    const adminSupabase = createAdminClient();
    
    const { data, error } = await adminSupabase.storage
      .from(mediaConfig.bucket)
      .createSignedUploadUrl(temporaryPath);

    if (error || !data) {
      return {
        status: "error",
        message: "Failed to generate upload authorization. Please try again later.",
      };
    }

    return {
      status: "success",
      message: "Authorization generated.",
      signedUrl: data.signedUrl,
      token: data.token,
      path: temporaryPath,
    };

  } catch (err) {
    const mapped = mapMediaError(err);
    return {
      status: "error",
      message: mapped.message,
    };
  }
}

/**
 * Server Action: Complete direct browser upload, download file, validate bytes with sharp,
 * move to final location, and register in database.
 */
export async function completeImageUploadAction(
  formData: FormData
): Promise<UploadActionState> {
  let temporaryPath = "";
  let finalPath = "";
  const adminSupabase = createAdminClient();

  try {
    // 1. Authorize user
    const profile = await requireActiveUser();

    // 2. Validate paths inputs
    const rawPath = formData.get("temporaryPath") as string;
    const rawFilename = formData.get("originalFilename") as string;

    const result = completeImageUploadSchema.safeParse({
      temporaryPath: rawPath,
      originalFilename: rawFilename,
    });

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid file completion parameters.",
      };
    }

    temporaryPath = result.data.temporaryPath;
    const { originalFilename } = result.data;

    // 3. Validate path structure belongs to current user
    if (!isOwnedTemporaryImagePath(temporaryPath, profile.id)) {
      return {
        status: "error",
        message: "Invalid file path ownership parameters.",
      };
    }

    // 4. Download file from storage using the authenticated client to let RLS verify ownership
    const supabase = await createClient();
    const { data: blobData, error: downloadError } = await supabase.storage
      .from(mediaConfig.bucket)
      .download(temporaryPath);

    if (downloadError || !blobData) {
      throw new Error("upload_failed");
    }

    const arrayBuffer = await blobData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Inspect bytes using sharp (MIME, dimensions, animations, corruptions)
    const inspected = await inspectImage(buffer);

    // 6. Generate final path: users/{userId}/inputs/{uuid}.{ext}
    const objectUuid = crypto.randomUUID();
    const extension = mimeToExtension(inspected.mimeType) || "jpg";
    finalPath = createFinalImagePath(profile.id, objectUuid, extension);

    // 7. Move validated object to final path using the admin client
    const { error: moveError } = await adminSupabase.storage
      .from(mediaConfig.bucket)
      .move(temporaryPath, finalPath);

    if (moveError) {
      throw new Error("registration_failed");
    }

    // 8. Register the asset in database using service-role INSERT
    const { data: assetRow, error: insertError } = await adminSupabase
      .from("media_assets")
      .insert({
        user_id: profile.id,
        asset_type: "input_image",
        storage_bucket: mediaConfig.bucket,
        storage_path: finalPath,
        mime_type: inspected.mimeType,
        file_size_bytes: inspected.fileSizeBytes,
        width: inspected.width,
        height: inspected.height,
        checksum: inspected.sha256,
        original_filename: originalFilename,
      })
      .select()
      .single();

    if (insertError) {
      // Rollback Storage move on insert error
      await adminSupabase.storage.from(mediaConfig.bucket).remove([finalPath]);
      throw new Error("registration_failed");
    }

    // 9. Generate short-lived signed preview URL
    const previewUrl = await createPreviewUrl(assetRow.id, profile.id);

    return {
      status: "success",
      message: "Image uploaded and validated successfully.",
      data: {
        id: assetRow.id,
        assetType: "input_image",
        originalFilename: assetRow.original_filename,
        mimeType: assetRow.mime_type || inspected.mimeType,
        fileSizeBytes: assetRow.file_size_bytes ? Number(assetRow.file_size_bytes) : inspected.fileSizeBytes,
        width: assetRow.width ? Number(assetRow.width) : inspected.width,
        height: assetRow.height ? Number(assetRow.height) : inspected.height,
        previewUrl,
        previewExpiresAt: new Date(Date.now() + mediaConfig.signedPreviewSeconds * 1000).toISOString(),
      },
    };

  } catch (err) {
    // Failure cleanup: remove temporary file if validation failed
    if (temporaryPath) {
      await adminSupabase.storage.from(mediaConfig.bucket).remove([temporaryPath]);
    }
    
    const mapped = mapMediaError(err);
    return {
      status: "error",
      message: mapped.message,
    };
  }
}

/**
 * Server Action: Remove (soft delete) input image asset and delete the corresponding file from Storage.
 */
export async function removeInputImageAction(
  formData: FormData
): Promise<UploadActionState> {
  try {
    // 1. Authorize user
    const profile = await requireActiveUser();

    // 2. Validate asset ID
    const rawAssetId = formData.get("assetId") as string;
    const result = removeImageInputSchema.safeParse({ assetId: rawAssetId });

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid asset identifier provided.",
      };
    }

    const { assetId } = result.data;

    // 3. Fetch asset using authenticated client to let RLS verify ownership
    const supabase = await createClient();
    const { data: asset, error: fetchError } = await supabase
      .from("media_assets")
      .select("storage_path, generation_id")
      .eq("id", assetId)
      .eq("user_id", profile.id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !asset) {
      return {
        status: "error",
        message: "Asset not found or access denied.",
      };
    }

    // 4. Block deletion if connected to a generation
    if (asset.generation_id) {
      return {
        status: "error",
        message: "This asset cannot be deleted because it is linked to a generation history record.",
      };
    }

    // 5. Delete file from Storage and soft-delete in DB via service role client
    const adminSupabase = createAdminClient();

    // Remove from storage
    const { error: storageError } = await adminSupabase.storage
      .from(mediaConfig.bucket)
      .remove([asset.storage_path]);

    if (storageError) {
      throw new Error("delete_failed");
    }

    // Soft delete in database
    const { error: dbError } = await adminSupabase
      .from("media_assets")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", assetId);

    if (dbError) {
      throw new Error("delete_failed");
    }

    return {
      status: "success",
      message: "Asset removed successfully.",
    };

  } catch (err) {
    const mapped = mapMediaError(err);
    return {
      status: "error",
      message: mapped.message,
    };
  }
}
