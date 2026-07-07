import "server-only";

import crypto from "crypto";
import sharp, { type Metadata } from "sharp";
import { mediaConfig, validateDimensions } from "@/config/media";

export interface ImageInspectionResult {
  format: "jpeg" | "png" | "webp";
  mimeType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  sha256: string;
}

/**
 * Downloads file bytes and inspects structure using sharp.
 * Enforces mime checking, resolution checks, and animation blocking.
 */
export async function inspectImage(buffer: Buffer): Promise<ImageInspectionResult> {
  const fileSizeBytes = buffer.length;

  if (fileSizeBytes > mediaConfig.maxImageBytes) {
    throw new Error("file_too_large");
  }

  let metadata: Metadata;
  try {
    const image = sharp(buffer);
    metadata = await image.metadata();
  } catch {
    throw new Error("corrupt_image");
  }

  const format = metadata.format;
  if (!format || !["jpeg", "png", "webp"].includes(format)) {
    throw new Error("invalid_file_type");
  }

  const width = metadata.width;
  const height = metadata.height;
  if (!width || !height) {
    throw new Error("corrupt_image");
  }

  // Validate aspect ratio/dimensions and pixel counts
  const dimensionValidation = validateDimensions(width, height);
  if (!dimensionValidation.valid) {
    if (dimensionValidation.error?.includes("exceeds")) {
      throw new Error("too_many_pixels");
    }
    if (dimensionValidation.error?.includes("at least")) {
      throw new Error("image_too_small");
    }
    throw new Error("image_too_large");
  }

  // Reject animated files (e.g. animated webp or multiple page gifs masqueraded)
  const isAnimated = (metadata.pages && metadata.pages > 1) || !!metadata.delay || !!metadata.loop;
  if (isAnimated) {
    throw new Error("animated_image_not_supported");
  }

  // Check actual MIME mappings
  let mimeType = "image/jpeg";
  if (format === "png") {
    mimeType = "image/png";
  } else if (format === "webp") {
    mimeType = "image/webp";
  }

  // Calculate SHA-256 checksum
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    format: format as "jpeg" | "png" | "webp",
    mimeType,
    width,
    height,
    fileSizeBytes,
    sha256,
  };
}
