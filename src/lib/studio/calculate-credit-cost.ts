/**
 * Authoritative Server-Side Credit Cost Calculator
 * Uses integer math to prevent floating point drift and overflows.
 */
export function calculateGenerationCreditCost({
  baseCreditCost,
  creditCostPerSecond,
  durationSeconds,
}: {
  baseCreditCost: number | string;
  creditCostPerSecond: number | string;
  durationSeconds: number;
}): string {
  const base = Math.floor(Number(baseCreditCost));
  const perSecond = Math.floor(Number(creditCostPerSecond));

  if (isNaN(base) || base < 0) {
    throw new Error("Invalid base credit cost value");
  }
  if (isNaN(perSecond) || perSecond < 0) {
    throw new Error("Invalid credit cost per second value");
  }
  if (durationSeconds < 0 || isNaN(durationSeconds)) {
    throw new Error("Invalid generation duration seconds");
  }

  // Calculate using BigInt to prevent overflow on safe integer boundaries
  const totalCost = BigInt(base) + (BigInt(perSecond) * BigInt(durationSeconds));
  return totalCost.toString();
}
