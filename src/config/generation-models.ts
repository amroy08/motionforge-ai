/**
 * AI Model configuration types and defaults.
 *
 * In production, model data comes from the database.
 * This file provides TypeScript types and any static
 * fallback configuration needed during development.
 */

export type GenerationType =
  | "text_to_image"
  | "image_to_image"
  | "text_to_video"
  | "image_to_video";

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

export type Duration = 3 | 5 | 10;

export interface AIModelConfig {
  id: string;
  provider: string;
  providerModelId: string;
  name: string;
  slug: string;
  description: string;
  generationType: GenerationType;
  baseCreditCost: number;
  creditCostPerSecond: number;
  supportedDurations: Duration[];
  supportedAspectRatios: AspectRatio[];
  supportsImageInput: boolean;
  supportsTextInput: boolean;
  isActive: boolean;
  isFeatured: boolean;
}

/**
 * Calculate the total credit cost for a generation.
 * This is a shared utility — the server must always
 * recompute cost independently of the frontend.
 */
export function calculateCreditCost(
  baseCost: number,
  costPerSecond: number,
  durationSeconds: number,
): number {
  return baseCost + costPerSecond * durationSeconds;
}
