/**
 * useT — hook that returns a translation function bound to the current
 * language setting. Usage: const t = useT(); then t("nav.dashboard")
 */
import { useSettingsStore } from "../store/settingsStore";
import { TRANSLATIONS, resolveLangKey } from "../i18n/translations";

export function useT() {
  const language = useSettingsStore((s) => s.settings.language);
  const langKey = resolveLangKey(language);
  const dict = TRANSLATIONS[langKey];
  return (key: string): string => dict[key] ?? key;
}
