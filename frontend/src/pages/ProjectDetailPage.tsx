/**
 * ProjectDetailPage — Full project view with audit, data, and project details.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjectStore } from "../store/projectStore";
import { Layout } from "../components/Layout";
import { AuditTrail } from "../components/audit";
import { DataImportExport } from "../components/data";
import { RoleGuard } from "../components/auth";
import { StateBadge } from "../components/ui/StatusBadge";
import { Modal, FormField, ConfirmDialog, showToast, CostBadge } from "../components/ui";
import { useT } from "../hooks/useT";
import type { ProjectState } from "../types";
import { VALID_TRANSITIONS } from "../types";
import { formatCurrency } from "../utils/format";

type TabId = "audit" | "data";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const { selectedProject, selectedKPI, isLoading, error, fetchProject, deleteProject } =
    useProjectStore();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showStateChange, setShowStateChange] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("audit");

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id, fetchProject]);

  const handleDelete = async () => {
    if (!selectedProject) return;
    await deleteProject(selectedProject.id);
    showToast("Project deleted", "success");
    navigate("/dashboard", { replace: true });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4f46e5", borderTopColor: "transparent" }} />
        </div>
      </Layout>
    );
  }

  if (error || !selectedProject) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <p className="text-red-500 mb-4">{error ?? "Project not found."}</p>
          <Link to="/dashboard" className="text-sm underline font-medium text-indigo-600 hover:text-indigo-700">← Back to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  const project = selectedProject;
  const allowedTransitions = VALID_TRANSITIONS[project.state] ?? [];
  const isTerminal = allowedTransitions.length === 0;
  const isReopenable = allowedTransitions.length === 1 && allowedTransitions[0] === "PLANNING";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{project.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <StateBadge state={project.state} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {t("project.bac")}: <strong>{formatCurrency(project.bac)}</strong>
              {selectedKPI && (
                <>
                  <span className="mx-2">·</span>
                  {t("kpi.actual_cost")}: <strong>{formatCurrency(selectedKPI.ac)}</strong>
                  <span className="ml-2"><CostBadge status={selectedKPI.ac_status} label={t("kpi.ac_vs_bac")} /></span>
                </>
              )}
              <span className="mx-2">·</span>
              {t("project.created")} {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!isTerminal && !isReopenable && (
              <button type="button" className="px-4 py-2 text-sm rounded-lg text-white font-medium bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowStateChange(true)}>
                {t("project.change_state")}
              </button>
            )}
            {isReopenable && (
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg text-white font-medium bg-amber-500 hover:bg-amber-600 flex items-center gap-1.5"
                onClick={() => setShowStateChange(true)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t("project.reopen")}
              </button>
            )}
            <button type="button" className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => setShowEdit(true)}>{t("project.edit")}</button>
            <RoleGuard allowed={["admin"]}>
              <button type="button" className="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100" onClick={() => setShowDelete(true)}>{t("project.delete")}</button>
            </RoleGuard>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {([ 
            ["audit", t("project.audit")],
            ["data", t("project.import_export")],
          ] satisfies [TabId, string][]).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab as TabId)}
              className={`px-4 py-2 text-sm rounded-lg font-bold transition-all ${activeTab === tab ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-xl shadow p-6">
            <AuditTrail projectId={project.id} />
          </div>
        )}

        {activeTab === "data" && (
          <div className="bg-white rounded-xl shadow p-6">
            <DataImportExport projectId={project.id} onImported={() => { if (id) fetchProject(id); }} />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditProjectModal project={project} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); if (id) fetchProject(id); }} />
      )}

      {/* State Change Modal */}
      {showStateChange && (
        <StateChangeModal projectId={project.id} currentState={project.state} version={project.version} allowed={allowedTransitions} onClose={() => setShowStateChange(false)} onChanged={() => { setShowStateChange(false); if (id) fetchProject(id); }} />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title={t("action.delete")} message={`${t("action.delete")} "${project.name}"?`} confirmLabel={t("action.delete")} isDestructive />
    </Layout>
  );
}

/* ── Edit Project Modal ────────────────────────── */

function EditProjectModal({ project, onClose, onSaved }: Readonly<{ project: { id: string; name: string; bac: number; version: number }; onClose: () => void; onSaved: () => void }>) {
  const { updateProject } = useProjectStore();
  const t = useT();
  const [name, setName] = useState(project.name);
  const [bac, setBac] = useState(project.bac.toString());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProject(project.id, { name: name.trim(), bac: Number(bac), version: project.version });
      showToast("Project updated", "success");
      onSaved();
    } catch {
      showToast("Failed to update project", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t("project.edit_title")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name" name="editName" value={name} onChange={(e) => setName(e.target.value)} required />
        <FormField label="Budget (BAC)" name="editBac" type="number" value={bac} onChange={(e) => setBac(e.target.value)} required min={1} step="0.01" />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">{t("action.cancel")}</button>
          <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0">{saving ? t("action.saving") : t("project.save")}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ── State Change Modal ────────────────────────── */

function StateChangeModal({ projectId, currentState, version, allowed, onClose, onChanged }: Readonly<{ projectId: string; currentState: ProjectState; version: number; allowed: ProjectState[]; onClose: () => void; onChanged: () => void }>) {
  const { updateProject } = useProjectStore();
  const t = useT();
  const [selected, setSelected] = useState<ProjectState | "">("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await updateProject(projectId, { state: selected, version });
      showToast(`State: ${currentState} → ${selected}`, "success");
      onChanged();
    } catch {
      showToast("Failed to change state", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t("project.change_state")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">Current: <StateBadge state={currentState} /></p>
        <div className="space-y-2">
          {allowed.map((state) => (
            <label key={state} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selected === state ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
              <input type="radio" name="state" value={state} checked={selected === state} onChange={() => setSelected(state)} className="accent-indigo-600" />
              <StateBadge state={state} />
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">{t("action.cancel")}</button>
          <button type="submit" disabled={saving || !selected} className="px-4 py-2 text-sm rounded-lg text-white font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">{saving ? t("action.saving") : t("action.confirm")}</button>
        </div>
      </form>
    </Modal>
  );
}
