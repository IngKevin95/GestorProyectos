import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SystemSettings } from "../types";
import { getSettings, updateSettings } from "../services/apiService";

interface SettingsState {
  settings: SystemSettings;
  loaded: boolean;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (partial: Partial<SystemSettings>) => Promise<void>;
}

const DEFAULTS: SystemSettings = {
  country: "CO",
  currency: "COP",
  currency_symbol: "$",
  currency_decimals: "0",
  language: "es-CO",
  timezone: "America/Bogota",
  date_format: "dd/MM/yyyy",
  thousand_separator: ".",
  decimal_separator: ",",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULTS,
      loaded: false,
      loading: false,

      fetchSettings: async () => {
        set({ loading: true });
        try {
          const s = await getSettings();
          set({ settings: s, loaded: true });
        } catch {
          /* keep defaults */
        } finally {
          set({ loading: false });
        }
      },

      updateSettings: async (partial) => {
        set({ loading: true });
        try {
          const s = await updateSettings(partial);
          set({ settings: s });
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: "kpi-settings" },
  ),
);
