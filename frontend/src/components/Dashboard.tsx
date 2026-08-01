/**
 * Dashboard principal — muestra proyectos + KPI del proyecto seleccionado.
 */
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "./Layout";
import { useProjectStore } from "../store/projectStore";
import { formatCurrency } from "../utils/format";
import * as svc from "../services/apiService";
import type { ProjectTemplate } from "../types";
import { useT } from "../hooks/useT";

export function Dashboard() {
  const { projects, selectedProject, selectedKPI, fetchProjects, fetchProject, deleteProject, isLoading } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Close 3-dot menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const stateColor: Record<string, string> = {
    PLANNING: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    PAUSED: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    COMPLETED: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };

  return (
    <Layout>
      {/* Brand hero banner */}
      <div className="relative overflow-hidden bg-slate-950 rounded-3xl mb-8 shadow-xl border border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="absolute -bottom-[50%] -right-[10%] w-[60%] h-[150%] rounded-full bg-cyan-500/20 blur-[100px]" />
        </div>
        <div className="px-8 py-10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-3xl font-black text-white">E</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">{t("nav.platform_name")}</h1>
              <p className="text-indigo-200/80 text-sm font-medium mt-1">{t("dashboard.dashboard_subtitle")}</p>
            </div>
          </div>
          <div className="hidden sm:block text-5xl font-black text-white/5 tracking-widest">KPI</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project list */}
        <section className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{t("dashboard.projects")}</h2>
            <button
              type="button"
              className="text-sm px-4 py-2 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
              onClick={() => setShowCreate(true)}
            >
              {t("dashboard.new")}
            </button>
          </div>
          {isLoading && <p className="text-slate-400 text-sm px-2 font-medium">{t("dashboard.loading")}</p>}
          {!isLoading && projects.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 border-dashed">
              <p className="text-slate-400 text-sm font-medium">{t("dashboard.empty")}</p>
            </div>
          )}
          <div className="space-y-3">
          {!isLoading && projects.length > 0 && projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className={`relative w-full text-left p-5 rounded-2xl border transition-all select-none hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
                selectedProject?.id === project.id ? "border-indigo-500 bg-indigo-50/30 shadow-md ring-1 ring-indigo-500/20" : "border-slate-200 bg-white shadow-sm"
              }`}
              onClick={(e) => {
                if (e.detail === 2) return; // double-click handled by onDoubleClick
                fetchProject(project.id);
              }}
              onDoubleClick={() => navigate(`/projects/${project.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/projects/${project.id}`); }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 truncate text-base">{project.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${stateColor[project.state] ?? "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    {project.state}
                  </span>
                  {/* 3-dot menu */}
                  <div className="relative" ref={menuOpenId === project.id ? menuRef : undefined}>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === project.id ? null : project.id); }}
                      aria-label="Acciones rápidas"
                    >
                      <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {menuOpenId === project.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 text-sm animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 font-medium text-slate-700 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); navigate(`/projects/${project.id}`); }}
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          {t("dashboard.view_details")}
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 font-medium text-slate-700 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); fetchProject(project.id); }}
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                          {t("dashboard.view_kpi")}
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-3 font-medium transition-colors"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); if (confirm(`${t("dashboard.delete_confirm")} "${project.name}"?`)) deleteProject(project.id).then(() => fetchProjects()); }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {t("action.delete")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                BAC: {formatCurrency(project.bac)}
              </div>
            </button>
          ))}
          </div>
        </section>

        {/* KPI Detail */}
        <section className="lg:col-span-2 space-y-4">
          {selectedProject ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedProject.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${stateColor[selectedProject.state] ?? "bg-slate-50 border-slate-200 text-slate-500"}`}>
                      {selectedProject.state}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/projects/${selectedProject.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  Ver Detalles
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
              {/* the rest of KPI content goes here in actual implementation */}
              <div className="p-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50">
                <p className="text-slate-400 font-medium">Las métricas KPI del proyecto se mostrarán aquí.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-3xl shadow-sm border border-slate-100 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center">
                <span className="text-4xl font-black text-slate-200 tracking-widest">KPI</span>
              </div>
              <p className="text-slate-400 font-medium">{t("dashboard.select_project")}</p>
            </div>
          )}
        </section>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} />
      )}
    </Layout>
  );
}

function CreateProjectModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const { createProject } = useProjectStore();
  const t = useT();
  const [name, setName] = useState("");
  const [bac, setBac] = useState("");
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    svc.getTemplates().then(setTemplates).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bacNum = Number.parseFloat(bac);
    if (!name.trim() || Number.isNaN(bacNum) || bacNum <= 0) {
      setError(t("dashboard.name_required"));
      return;
    }
    setApplying(true);
    try {
      const project = await createProject(name.trim(), bacNum);

      // Apply template if selected
      const tpl = templates.find((t) => t.id === selectedTemplate);
      if (tpl) {
        for (const phase of tpl.structure) {
          const phaseBac = Math.round(bacNum * phase.bac_percent / 100);
          const createdPhase = await svc.createPhase(project.id, { name: phase.name, bac: phaseBac });
          for (const dept of phase.departments ?? []) {
            const deptBac = Math.round(phaseBac * dept.bac_percent / 100);
            await svc.createDepartment(project.id, createdPhase.id, { name: dept.name, bac: deptBac });
          }
        }
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail?.message ?? "Error al crear el proyecto");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <form
        className="relative bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95"
        onSubmit={handleSubmit}
      >
        <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{t("dashboard.new_project")}</h3>
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-6 font-medium">
            {error}
          </div>
        )}
        <div className="space-y-5">
          <div>
            <label htmlFor="project-name" className="block text-sm font-bold text-slate-700 mb-1.5">{t("dashboard.project_name")}</label>
            <input
              id="project-name"
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("dashboard.name_placeholder")}
              required
            />
          </div>
          <div>
            <label htmlFor="project-bac" className="block text-sm font-bold text-slate-700 mb-1.5">{t("dashboard.budget")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 font-medium">$</span>
              </div>
              <input
                id="project-bac"
                type="number"
                min="1"
                step="0.01"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
                value={bac}
                onChange={(e) => setBac(e.target.value)}
                placeholder="100,000"
                required
              />
            </div>
          </div>
          {/* Template selector */}
          {templates.length > 0 && (
            <div>
              <label htmlFor="project-tpl" className="block text-sm font-bold text-slate-700 mb-1.5">Plantilla (opcional)</label>
              <select
                id="project-tpl"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium appearance-none"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">Sin plantilla — proyecto vacío</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.structure.length} fases)</option>
                ))}
              </select>
              {selectedTemplate && (
                <p className="text-xs text-slate-500 font-medium mt-2 bg-slate-50 p-2.5 rounded-lg">
                  {templates.find((t) => t.id === selectedTemplate)?.description}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-8">
          <button
            type="button"
            className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={onClose}
          >
            {t("action.cancel")}
          </button>
          <button
            type="submit"
            disabled={applying}
            className="flex-1 px-4 py-3.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            {applying ? t("dashboard.creating") : t("dashboard.create_project")}
          </button>
        </div>
      </form>
    </div>
  );
}
