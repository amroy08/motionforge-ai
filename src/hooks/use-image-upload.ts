"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  prepareImageUploadAction,
  completeImageUploadAction,
  removeInputImageAction,
  type SafeAssetDetails,
} from "@/app/(dashboard)/create/upload-actions";
import { mediaConfig, formatBytes } from "@/config/media";

export type ImageUploadStage =
  | "idle"
  | "selected"
  | "preparing"
  | "uploading"
  | "validating"
  | "complete"
  | "error";

export function useImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<ImageUploadStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [completedAsset, setCompletedAsset] = useState<SafeAssetDetails | null>(null);

  // Clean up object URLs to prevent browser memory leaks
  const cleanPreview = useCallback(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Preliminary Client-side Validation (non-security layer for instant feedback)
   */
  const selectFile = useCallback((selectedFile: File) => {
    cleanPreview();
    setError(null);
    setCompletedAsset(null);

    // 1. File size limit
    if (selectedFile.size > mediaConfig.maxImageBytes) {
      setError(`File is too large. Max size is ${formatBytes(mediaConfig.maxImageBytes)}.`);
      setStage("error");
      return;
    }

    // 2. MIME type check
    if (!(mediaConfig.allowedImageMimeTypes as readonly string[]).includes(selectedFile.type)) {
      setError("Unsupported format. Please select a JPEG, PNG, or WebP image.");
      setStage("error");
      return;
    }

    // 3. Create local preview URL
    const localUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(localUrl);
    setStage("selected");
  }, [cleanPreview]);

  /**
   * Directly Upload from browser to Supabase using Signed Upload Token
   */
  const startUpload = useCallback(async () => {
    if (!file || stage !== "selected") return;

    setStage("preparing");
    setError(null);

    try {
      // Step A: Request signed upload token via Server Action
      const prepareData = new FormData();
      prepareData.append("originalFilename", file.name);
      prepareData.append("mimeType", file.type);
      prepareData.append("sizeBytes", String(file.size));

      const prepareRes = await prepareImageUploadAction(prepareData);

      if (prepareRes.status === "error" || !prepareRes.signedUrl || !prepareRes.token || !prepareRes.path) {
        setError(prepareRes.message || "Failed to authorize upload.");
        setStage("error");
        return;
      }

      setStage("uploading");

      // Step B: Upload file directly from browser to Supabase Storage
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(mediaConfig.bucket)
        .uploadToSignedUrl(prepareRes.path, prepareRes.token, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setError("Failed uploading image to storage. Please try again.");
        setStage("error");
        return;
      }

      setStage("validating");

      // Step C: Trigger server-side inspection and database registration
      const completeData = new FormData();
      completeData.append("temporaryPath", prepareRes.path);
      completeData.append("originalFilename", file.name);

      const completeRes = await completeImageUploadAction(completeData);

      if (completeRes.status === "error" || !completeRes.data) {
        setError(completeRes.message || "Validation failed.");
        setStage("error");
        return;
      }

      // Step D: Successfully completed
      setCompletedAsset(completeRes.data);
      setPreviewUrl(completeRes.data.previewUrl);
      setStage("complete");

    } catch {
      setError("An unexpected error occurred during upload.");
      setStage("error");
    }
  }, [file, stage]);

  /**
   * Resets upload states to default
   */
  const resetUpload = useCallback(() => {
    cleanPreview();
    setFile(null);
    setCompletedAsset(null);
    setError(null);
    setStage("idle");
  }, [cleanPreview]);

  /**
   * Removes current completed input asset from database and Storage
   */
  const removeAsset = useCallback(async () => {
    if (!completedAsset) return;

    setStage("preparing");
    try {
      const removeData = new FormData();
      removeData.append("assetId", completedAsset.id);

      const res = await removeInputImageAction(removeData);
      if (res.status === "error") {
        setError(res.message || "Failed to remove the asset.");
        setStage("error");
      } else {
        resetUpload();
      }
    } catch {
      setError("Failed to delete the asset.");
      setStage("error");
    }
  }, [completedAsset, resetUpload]);

  return {
    file,
    previewUrl,
    stage,
    error,
    completedAsset,
    selectFile,
    startUpload,
    resetUpload,
    removeAsset,
  };
}
