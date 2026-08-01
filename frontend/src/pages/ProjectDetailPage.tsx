/**
 * ProjectDetailPage — Full project view with tasks and audit.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjectStore } from "../store/projectStore";
import { Layout } from "../components/Layout";
import { AuditTrail } from "../components/audit";
import { RoleGuard } from "../components/auth";
import { StateBadge } from "../components/ui/StatusBadge";
import { Modal, ConfirmDialog, showToast } from "../components/ui";
import { ProjectForm } from "../components/ProjectForm";
import { useT } from "../hooks/useT";
import type { ProjectState } from "../types";
import { VALID_TRANSITIONS } from "../types";

type TabId = "tasks" | "audit";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const { selectedProject, selectedKPI, isLoading, error, fetchProject, updateProject, deleteProject } =
    useProjectStore();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showStateChange, setShowStateChange] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("tasks");

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id, fetchProject]);

  const handleDelete = async () => {
    if (!selectedProject) return;
    await deleteProject(selectedProject.id);
    showToast("Proyecto eliminado", "success");
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
  const allowedTransitions = VALID_TRANSITIONS[project.state ?? "PLANNING"] ?? [];
  const isTerminal = allowedTransitions.length === 0;
  const isReopenable = allowedTransitions.length === 1 && allowedTransitions[0] === "PLANNING";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500" aria-label="Migas de pan">
          <Link to="/dashboard" className="hover:text-slate-700 font-medium transition-colors">Dashboard</Link>
          <span className="mx-2 text-slate-300" aria-hidden="true">/</span>
          <span className="text-slate-700 font-semibold">{project.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <StateBadge state={project.state} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
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

        {/* Tabs — solo se muestra Auditoría hasta que Tareas esté disponible */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all ${activeTab === "audit" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
          >
            {t("project.audit")}
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <AuditTrail projectId={project.id} />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <ProjectForm
          open
          project={project}
          onClose={() => setShowEdit(false)}
          onSubmit={async (data) => {
            try {
              await updateProject(project.id, { ...data, version: project.version });
              showToast("Proyecto actualizado", "success");
              setShowEdit(false);
              if (id) fetchProject(id);
            } catch (err: any) {
              showToast(err?.response?.data?.detail?.message ?? "Error al actualizar", "error");
            }
          }}
          isLoading={isLoading}
        />
      )}

      {/* State Change Modal */}
      {showStateChange && project.state && project.version && (
        <StateChangeModal projectId={project.id} currentState={project.state} version={project.version} allowed={allowedTransitions} onClose={() => setShowStateChange(false)} onChanged={() => { setShowStateChange(false); if (id) fetchProject(id); }} />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title={t("action.delete")} message={`${t("action.delete")} "${project.name}"?`} confirmLabel={t("action.delete")} isDestructive />
    </Layout>
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
      showToast("Estado actualizado correctamente", "success");
      onChanged();
    } catch {
      showToast("Error al cambiar el estado", "error");
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
