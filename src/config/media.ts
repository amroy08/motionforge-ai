export const mediaConfig = {
  bucket: "user-media",
  maxImageBytes: 6 * 1024 * 1024, // 6 MiB
  allowedImageMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  allowedImageExtensions: ["jpg", "jpeg", "png", "webp"],
  minimumWidth: 256,
  minimumHeight: 256,
  maximumWidth: 8192,
  maximumHeight: 8192,
  maximumPixels: 40_000_000,
  signedPreviewSeconds: 600,
} as const;

/**
 * Maps a MIME type to a safe extension. Returns null if unsupported.
 */
export function mimeToExtension(mimeType: string): string | null {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

/**
 * Formats a byte size number into a reader friendly decimal string (e.g. "4.2 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validates dimensions against application configuration limits.
 */
export function validateDimensions(
  width: number,
  height: number
): { valid: boolean; error?: string } {
  if (width < mediaConfig.minimumWidth || height < mediaConfig.minimumHeight) {
    return {
      valid: false,
      error: `Image dimensions must be at least ${mediaConfig.minimumWidth}x${mediaConfig.minimumHeight} pixels.`,
    };
  }
  if (width > mediaConfig.maximumWidth || height > mediaConfig.maximumHeight) {
    return {
      valid: false,
      error: `Image dimensions must not exceed ${mediaConfig.maximumWidth}x${mediaConfig.maximumHeight} pixels.`,
    };
  }
  const pixels = width * height;
  if (pixels > mediaConfig.maximumPixels) {
    return {
      valid: false,
      error: `Image resolution exceeds the limit of ${mediaConfig.maximumPixels / 1000000} Megapixels.`,
    };
  }
  return { valid: true };
}

/**
 * Validates storage path format to prevent traversal exploits.
 */
export function validateStoragePath(path: string): boolean {
  // Reject path traversal, backslashes, absolute urls, double slashes, null bytes
  if (
    path.includes("..") ||
    path.includes("\\") ||
    path.includes(":") ||
    path.includes("//") ||
    path.includes("\0")
  ) {
    return false;
  }
  return true;
}
