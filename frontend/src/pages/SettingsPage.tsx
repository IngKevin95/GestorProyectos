/**
 * SettingsPage — System configuration: country, currency, language, timezone.
 * Admin only.
 */
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useSettingsStore } from "../store/settingsStore";
import { useT } from "../hooks/useT";
import { showToast } from "../components/ui";
import type { SystemSettings } from "../types";

/* ── Country → currency suggestion map ── */
const COUNTRY_OPTIONS: { code: string; name: string; currency: string; symbol: string; locale: string; tz: string; decimals: string }[] = [
  { code: "CO", name: "Colombia", currency: "COP", symbol: "$", locale: "es-CO", tz: "America/Bogota", decimals: "0" },
  { code: "US", name: "Estados Unidos", currency: "USD", symbol: "$", locale: "en-US", tz: "America/New_York", decimals: "2" },
  { code: "MX", name: "México", currency: "MXN", symbol: "$", locale: "es-MX", tz: "America/Mexico_City", decimals: "2" },
  { code: "AR", name: "Argentina", currency: "ARS", symbol: "$", locale: "es-AR", tz: "America/Argentina/Buenos_Aires", decimals: "2" },
  { code: "CL", name: "Chile", currency: "CLP", symbol: "$", locale: "es-CL", tz: "America/Santiago", decimals: "0" },
  { code: "PE", name: "Perú", currency: "PEN", symbol: "S/", locale: "es-PE", tz: "America/Lima", decimals: "2" },
  { code: "EC", name: "Ecuador", currency: "USD", symbol: "$", locale: "es-EC", tz: "America/Guayaquil", decimals: "2" },
  { code: "BR", name: "Brasil", currency: "BRL", symbol: "R$", locale: "pt-BR", tz: "America/Sao_Paulo", decimals: "2" },
  { code: "ES", name: "España", currency: "EUR", symbol: "€", locale: "es-ES", tz: "Europe/Madrid", decimals: "2" },
  { code: "GB", name: "Reino Unido", currency: "GBP", symbol: "£", locale: "en-GB", tz: "Europe/London", decimals: "2" },
];

const DATE_FORMATS = ["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd"];
const THOUSAND_SEPS = [{ label: "Punto (.)", value: "." }, { label: "Coma (,)", value: "," }, { label: "Espacio ( )", value: " " }];
const DECIMAL_SEPS = [{ label: "Coma (,)", value: "," }, { label: "Punto (.)", value: "." }];

/* Unique language options derived from COUNTRY_OPTIONS */
const LANGUAGE_OPTIONS = COUNTRY_OPTIONS.map((c) => ({ value: c.locale, label: `${c.name} (${c.locale})` }));

/* Combined currency + symbol options */
const CURRENCY_OPTIONS = COUNTRY_OPTIONS.map((c) => ({
  value: `${c.currency}|${c.symbol}`,
  label: `${c.currency} — ${c.name} (${c.symbol})`,
}));

/* Deduplicate currency options by value */
const UNIQUE_CURRENCY_OPTIONS = CURRENCY_OPTIONS.filter(
  (opt, idx, arr) => arr.findIndex((o) => o.value === opt.value) === idx
);

export function SettingsPage() {
  const { settings, loading, fetchSettings, updateSettings } = useSettingsStore();
  const t = useT();
  const [form, setForm] = useState<SystemSettings>({ ...settings });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  const handleCountryChange = (code: string) => {
    const match = COUNTRY_OPTIONS.find((c) => c.code === code);
    if (match) {
      setForm((prev) => ({
        ...prev,
        country: match.code,
        currency: match.currency,
        currency_symbol: match.symbol,
        language: match.locale,
        timezone: match.tz,
        currency_decimals: match.decimals,
      }));
    } else {
      setForm((prev) => ({ ...prev, country: code }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      showToast(t("settings.saved"), "success");
    } catch {
      showToast(t("settings.save_error"), "error");
    } finally {
      setSaving(false);
    }
  };

  const previewAmount = 1234567.89;
  let preview = "";
  try {
    preview = new Intl.NumberFormat(form.language, {
      style: "currency",
      currency: form.currency,
      minimumFractionDigits: Number.parseInt(form.currency_decimals) || 0,
      maximumFractionDigits: Number.parseInt(form.currency_decimals) || 0,
    }).format(previewAmount);
  } catch {
    preview = `${form.currency_symbol}${previewAmount.toLocaleString()}`;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-600 shadow-inner">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("settings.title")}</h1>
            <p className="text-sm text-gray-500">{t("settings.subtitle")}</p>
          </div>
        </div>

        {loading && !saving && (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "#4f46e5", borderTopColor: "transparent" }} />
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Preview card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm opacity-80 mb-1">{t("settings.preview")}</p>
            <p className="text-3xl font-bold">{preview}</p>
            <p className="text-xs opacity-60 mt-2">
              País: {COUNTRY_OPTIONS.find(c => c.code === form.country)?.name ?? form.country} · Moneda: {form.currency} · Idioma: {form.language}
            </p>
          </div>

          {/* Country & Currency */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>🌍</span> {t("settings.regionalization")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">{t("settings.country")}</label>
                <select
                  id="country"
                  value={form.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">{t("settings.currency")}</label>
                <select
                  id="currency"
                  value={`${form.currency}|${form.currency_symbol}`}
                  onChange={(e) => {
                    const [cur, sym] = e.target.value.split("|");
                    setForm((p) => ({ ...p, currency: cur, currency_symbol: sym }));
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {UNIQUE_CURRENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="currency_decimals" className="block text-sm font-medium text-gray-700 mb-1">Decimales</label>
                <select
                  id="currency_decimals"
                  value={form.currency_decimals}
                  onChange={(e) => setForm((p) => ({ ...p, currency_decimals: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="0">0 decimales</option>
                  <option value="1">1 decimal</option>
                  <option value="2">2 decimales</option>
                  <option value="3">3 decimales</option>
                </select>
              </div>
            </div>
          </div>

          {/* Language & Timezone */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>🗣️</span> {t("settings.lang_timezone")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">{t("settings.language")}</label>
                <select
                  id="language"
                  value={form.language}
                  onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">{t("settings.timezone")}</label>
                <select
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.tz}>{c.tz} — {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Format */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>🔢</span> {t("settings.numeric_format")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date_format" className="block text-sm font-medium text-gray-700 mb-1">{t("settings.date_format")}</label>
                <select
                  id="date_format"
                  value={form.date_format}
                  onChange={(e) => setForm((p) => ({ ...p, date_format: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="thousand_sep" className="block text-sm font-medium text-gray-700 mb-1">{t("settings.thousand_sep")}</label>
                <select
                  id="thousand_sep"
                  value={form.thousand_separator}
                  onChange={(e) => setForm((p) => ({ ...p, thousand_separator: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {THOUSAND_SEPS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="decimal_sep" className="block text-sm font-medium text-gray-700 mb-1">{t("settings.decimal_sep")}</label>
                <select
                  id="decimal_sep"
                  value={form.decimal_separator}
                  onChange={(e) => setForm((p) => ({ ...p, decimal_separator: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {DECIMAL_SEPS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm rounded-xl text-white font-bold disabled:opacity-50 transition-all bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                  {t("action.saving")}
                </span>
              ) : t("settings.save")}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
