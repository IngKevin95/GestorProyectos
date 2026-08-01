/**
 * Dashboard principal — muestra proyectos + KPI del proyecto seleccionado.
 */
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "./Layout";
import { useProjectStore } from "../store/projectStore";
import { ProjectForm } from "./ProjectForm";
import * as svc from "../services/apiService";
import { useT } from "../hooks/useT";
import { HealthBadge } from "./StatusBadge";

export function Dashboard() {
  const { projects, selectedProject, fetchProjects, fetchProject, createProject, deleteProject, isLoading } = useProjectStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const healthColor: Record<string, string> = {
    ok: "bg-green-100 text-green-700 border-green-200",
    blocked: "bg-red-100 text-red-700 border-red-200",
    at_risk: "bg-orange-100 text-orange-700 border-orange-200",
    no_next_step: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const healthLabel: Record<string, string> = {
    ok: "Saludable",
    blocked: "Bloqueado",
    at_risk: "En Riesgo",
    no_next_step: "Sin Siguiente Paso",
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

      {/* Global KPIs */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Total</p>
            <p className="text-3xl font-black text-slate-900">{projects.length}</p>
            <p className="text-xs text-slate-500 mt-1">Proyectos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">Activos</p>
            <p className="text-3xl font-black text-emerald-900">{projects.filter((p) => p.state === "ACTIVE").length}</p>
            <p className="text-xs text-emerald-600 mt-1">En ejecución</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Completados</p>
            <p className="text-3xl font-black text-slate-900">{projects.filter((p) => p.state === "COMPLETED").length}</p>
            <p className="text-xs text-slate-500 mt-1">Finalizados</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-2">Promedio Score</p>
            <p className="text-3xl font-black text-rose-900">
              {(projects.reduce((sum, p) => sum + (p.score ?? 0), 0) / projects.length).toFixed(1)}
            </p>
            <p className="text-xs text-rose-600 mt-1">Priorización</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project list */}
        <section className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{t("dashboard.projects")}</h2>
            <div className="flex gap-2">
              <Link
                to="/projects"
                className="text-sm px-4 py-2 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all font-bold"
              >
                Ver Todos
              </Link>
              <button
                type="button"
                className="text-sm px-4 py-2 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
                onClick={() => setShowCreateForm(true)}
              >
                Nuevo
              </button>
            </div>
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
                  {project.health_status && (
                    <HealthBadge health_status={project.health_status as any} />
                  )}
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
              <div className="flex items-center justify-end text-sm text-slate-500 font-medium mt-2">
                <div className="flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  {project.score !== null ? project.score.toFixed(2) : "0.00"}
                </div>
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

              {/* KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 border border-blue-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Estrategia</p>
                  <p className="text-2xl font-black text-blue-900">{selectedProject.priority_strategy === "relative" ? "Relativa" : selectedProject.priority_strategy === "absolute" ? "Absoluta" : "Mixta"}</p>
                  <p className="text-xs text-blue-600 mt-2">Cálculo de priorización</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Estado</p>
                  <p className="text-2xl font-black text-emerald-900">{selectedProject.state}</p>
                  <p className="text-xs text-emerald-600 mt-2">Situación actual</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">Responsable</p>
                  <p className="text-2xl font-black text-purple-900 truncate">{selectedProject.responsable || "—"}</p>
                  <p className="text-xs text-purple-600 mt-2">Propietario del proyecto</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Prioridad</p>
                  <p className="text-2xl font-black text-amber-900">{selectedProject.prioridad || "Media"}</p>
                  <p className="text-xs text-amber-600 mt-2">Nivel de importancia</p>
                </div>
              </div>

              {/* Additional Info */}
              {selectedProject.fecha_limite && (
                <div className="mt-4 p-4 bg-rose-50/50 border border-rose-200 rounded-2xl">
                  <p className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-2">Fecha Límite</p>
                  <p className="text-sm text-rose-900 font-medium">{new Date(selectedProject.fecha_limite).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              )}

              {selectedProject.siguiente_paso && (
                <div className="mt-3 p-4 bg-cyan-50/50 border border-cyan-200 rounded-2xl">
                  <p className="text-xs font-bold text-cyan-700 uppercase tracking-wide mb-2">Siguiente Paso</p>
                  <p className="text-sm text-cyan-900">{selectedProject.siguiente_paso}</p>
                </div>
              )}
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

      <ProjectForm
        open={showCreateForm}
        onSubmit={async (data) => {
          await createProject(data);
          await fetchProjects();
          setShowCreateForm(false);
        }}
        onClose={() => setShowCreateForm(false)}
        isLoading={isLoading}
      />
    </Layout>
  );
}
