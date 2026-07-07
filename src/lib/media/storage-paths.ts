import { validateStoragePath } from "@/config/media";

/**
 * Creates temporary upload path: users/{userId}/temporary/{uuid}.{extension}
 */
export function createTemporaryImagePath(userId: string, extension: string): string {
  const uuid = crypto.randomUUID();
  return `users/${userId}/temporary/${uuid}.${extension}`;
}

/**
 * Creates final inputs path: users/{userId}/inputs/{objectId}.{extension}
 */
export function createFinalImagePath(userId: string, objectId: string, extension: string): string {
  return `users/${userId}/inputs/${objectId}.${extension}`;
}

/**
 * Checks if the temporary path is structurally valid and belongs to the user.
 */
export function isOwnedTemporaryImagePath(path: string, userId: string): boolean {
  if (!validateStoragePath(path)) return false;
  
  // Format: users/{userId}/temporary/{uuid}.{ext}
  const parts = path.split("/");
  if (parts.length !== 4) return false;
  
  return (
    parts[0] === "users" &&
    parts[1] === userId &&
    parts[2] === "temporary"
  );
}

/**
 * Checks if the final path is structurally valid and belongs to the user.
 */
export function isOwnedFinalImagePath(path: string, userId: string): boolean {
  if (!validateStoragePath(path)) return false;
  
  // Format: users/{userId}/inputs/{uuid}.{ext}
  const parts = path.split("/");
  if (parts.length !== 4) return false;
  
  return (
    parts[0] === "users" &&
    parts[1] === userId &&
    parts[2] === "inputs"
  );
}
