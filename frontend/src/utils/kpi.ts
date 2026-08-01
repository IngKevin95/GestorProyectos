import type { KPIStatus } from "../types";

/**
 * Determine the AC vs BAC status color.
 * ≤100% → green, 101-110% → yellow, >110% → red, invalid → neutral
 */
export function getACvsBACStatus(ac: number, bac: number): KPIStatus {
  if (bac <= 0) return "neutral";
  const ratio = Math.round((ac / bac) * 10000) / 100;
  if (ratio <= 100) return "green";
  if (ratio <= 110) return "yellow";
  return "red";
}
