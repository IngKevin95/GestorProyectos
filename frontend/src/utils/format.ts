/**
 * Centralized currency / number formatting utilities.
 * Reads from settingsStore so every component uses the same config.
 */
import { useSettingsStore } from "../store/settingsStore";

/**
 * Format a number as currency using system settings.
 * Can be called outside React (reads store directly).
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "–";

  const { settings } = useSettingsStore.getState();

  const decimals = Number.parseInt(settings.currency_decimals, 10) || 0;
  const locale = settings.language || "es-CO";
  const currency = settings.currency || "COP";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    // Fallback if locale/currency not supported
    const sym = settings.currency_symbol || "$";
    return `${sym}${value.toLocaleString()}`;
  }
}

/**
 * Format a number as plain number with thousand separators (no currency symbol).
 */
export function formatNumber(value: number | null | undefined, decimals?: number): string {
  if (value == null) return "–";

  const { settings } = useSettingsStore.getState();
  const locale = settings.language || "es-CO";
  const maxDec = decimals ?? 2;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDec,
  }).format(value);
}

/**
 * Format a percentage value (e.g. 0.95 → "95%" or "95.0%")
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return "–";

  const { settings } = useSettingsStore.getState();
  const locale = settings.language || "es-CO";

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
