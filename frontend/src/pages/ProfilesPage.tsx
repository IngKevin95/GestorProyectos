/**
 * ProfilesPage — CRUD for cost profiles (hourly rates).
 */
import { useEffect, useState } from "react";
import { useProfileStore } from "../store/profileStore";
import { Layout } from "../components/Layout";
import { Modal, FormField, ConfirmDialog, EmptyState, showToast } from "../components/ui";
import { useT } from "../hooks/useT";
import { formatCurrency } from "../utils/format";
import type { Profile } from "../types";

export function ProfilesPage() {
  const t = useT();
  const { profiles, isLoading, fetchProfiles, createProfile, updateProfile, deleteProfile } = useProfileStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState<Profile | null>(null);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("profiles.title")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("profiles.subtitle")}</p>
          </div>
          <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm rounded-lg text-white font-medium bg-[#172E73] hover:bg-[#0f2060]"
            >
              + {t("profiles.create")}
            </button>
        </div>

        {isLoading && profiles.length === 0 && <p className="text-sm text-gray-400">{t("action.loading")}</p>}

        {!isLoading && profiles.length === 0 && (
          <EmptyState icon="👤" title={t("profiles.empty")} description={t("profiles.empty_desc")} />
        )}

        {profiles.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-medium">{t("profiles.name")}</th>
                  <th className="py-3 px-4 font-medium text-right">{t("profiles.hourly_rate")}</th>
                  <th className="py-3 px-4 font-medium text-center">{t("profiles.status")}</th>
                  <th className="py-3 px-4 font-medium text-right">{t("profiles.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{profile.name}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(profile.hourly_rate)}/h</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${profile.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {profile.is_active ? t("profiles.active") : t("profiles.inactive")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button type="button" onClick={() => setEditing(profile)} className="text-cyan-600 hover:underline mr-3 text-xs">{t("action.edit")}</button>
                      <button type="button" onClick={() => setDeleting(profile)} className="text-red-500 hover:underline text-xs">{t("action.delete")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <ProfileFormModal
          onClose={() => setShowCreate(false)}
          onSubmit={async (name, hourlyRate) => {
            await createProfile({ name, hourly_rate: hourlyRate });
            showToast(t("profiles.created"), "success");
            setShowCreate(false);
          }}
          title={t("profiles.create")}
          t={t}
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <ProfileFormModal
          onClose={() => setEditing(null)}
          onSubmit={async (name, hourlyRate) => {
            await updateProfile(editing.id, { name, hourly_rate: hourlyRate, version: editing.version });
            showToast(t("profiles.updated"), "success");
            setEditing(null);
          }}
          title={t("profiles.edit")}
          initial={editing}
          t={t}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await deleteProfile(deleting.id);
            showToast(t("profiles.deleted"), "success");
          }
        }}
        title={t("action.delete")}
        message={`${t("profiles.confirm_delete")} "${deleting?.name}"?`}
        confirmLabel={t("action.delete")}
        isDestructive
      />
    </Layout>
  );
}

/* ── Profile Form Modal ──────────────────────── */

function ProfileFormModal({
  onClose,
  onSubmit,
  title,
  initial,
  t,
}: Readonly<{
  onClose: () => void;
  onSubmit: (name: string, hourlyRate: number) => Promise<void>;
  title: string;
  initial?: Profile;
  t: (key: string) => string;
}>) {
  const [name, setName] = useState(initial?.name ?? "");
  const [hourlyRate, setHourlyRate] = useState(initial?.hourly_rate?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const valid = name.trim().length > 0 && Number(hourlyRate) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    setError("");
    try {
      await onSubmit(name.trim(), Number(hourlyRate));
    } catch {
      setError(t("profiles.save_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label={t("profiles.name")} name="profileName" value={name} onChange={(e) => setName(e.target.value)} required />
        <FormField
          label={t("profiles.hourly_rate")}
          name="profileRate"
          type="number"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          min={0.01}
          step="0.01"
          required
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">
            {t("action.cancel")}
          </button>
          <button
            type="submit"
            disabled={!valid || saving}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium bg-[#172E73] hover:bg-[#0f2060] disabled:opacity-50"
          >
            {saving ? t("action.saving") : t("action.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
