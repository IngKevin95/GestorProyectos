/**
 * Dashboard principal — muestra proyectos + KPI del proyecto seleccionado.
 * Fix UX: single-click = seleccionar + ver KPI. Botón explícito para navegar al detalle.
 * Fix UX: estados mapeados a español. Fix UX: confirm() reemplazado por ConfirmDialog.
 */
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "./Layout";
import { useProjectStore } from "../store/projectStore";
import { ProjectForm } from "./ProjectForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { useT } from "../hooks/useT";
import { HealthBadge, StateBadge } from "./StatusBadge";

/* ── Mapeo de estado para Score KPI ── */
const SCORE_MAX = 1.0;

export function Dashboard() {
  const { projects, selectedProject, fetchProjects, fetchProject, createProject, deleteProject, isLoading } = useProjectStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
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

  const avgScore = projects.length > 0
    ? projects.reduce((sum, p) => sum + (p.score ?? 0), 0) / projects.length
    : 0;

  return (
    <Layout>
      {/* Brand hero banner */}
      <div className="relative overflow-hidden bg-slate-950 rounded-2xl mb-8 shadow-xl border border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="absolute -bottom-[50%] -right-[10%] w-[60%] h-[150%] rounded-full bg-cyan-500/20 blur-[100px]" />
        </div>
        <div className="px-8 py-9 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-2xl font-black text-white">G</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">{t("nav.platform_name")}</h1>
              <p className="text-indigo-200/70 text-sm font-normal mt-0.5">{t("dashboard.dashboard_subtitle")}</p>
            </div>
          </div>
          <div className="hidden sm:block text-4xl font-black text-white/5 tracking-widest select-none">KPI</div>
        </div>
      </div>

      {/* Global KPIs */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total</p>
            <p className="text-3xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Proyectos</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Activos</p>
            <p className="text-3xl font-bold text-emerald-700">{projects.filter((p) => p.state === "ACTIVE").length}</p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">En ejecución</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Completados</p>
            <p className="text-3xl font-bold text-slate-700">{projects.filter((p) => p.state === "COMPLETED").length}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Finalizados</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">Score Promedio</p>
            <p className="text-3xl font-bold text-slate-900">{avgScore.toFixed(1)}</p>
            <div className="mt-2">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full transition-all"
                  style={{ width: `${Math.min((avgScore / SCORE_MAX) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">de {SCORE_MAX} posibles</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project list */}
        <section className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">{t("dashboard.projects")}</h2>
            <div className="flex gap-2">
              <Link
                to="/projects"
                className="text-sm px-3 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors font-medium"
              >
                Ver todos
              </Link>
              <button
                type="button"
                className="text-sm px-3 py-1.5 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                onClick={() => setShowCreateForm(true)}
              >
                Nuevo proyecto
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl border border-slate-100 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && projects.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-100 border-dashed">
              <p className="text-slate-400 text-sm font-medium">{t("dashboard.empty")}</p>
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                onClick={() => setShowCreateForm(true)}
              >
                Crear primer proyecto
              </button>
            </div>
          )}

          <div className="space-y-2">
            {!isLoading && projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={`relative w-full text-left p-4 rounded-xl border transition-all select-none hover:shadow-md cursor-pointer group ${
                  selectedProject?.id === project.id
                    ? "border-indigo-400 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-400/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                onClick={() => fetchProject(project.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-slate-800 text-sm leading-snug truncate flex-1">{project.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {project.health_status && (
                      <HealthBadge health_status={project.health_status as "ok" | "blocked" | "at_risk" | "no_next_step"} />
                    )}
                    <StateBadge state={project.state} />
                    {/* 3-dot menu */}
                    <div className="relative" ref={menuOpenId === project.id ? menuRef : undefined}>
                      <button
                        type="button"
                        className="p-1 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === project.id ? null : project.id); }}
                        aria-label="Acciones rápidas"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {menuOpenId === project.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 text-sm">
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 font-medium text-slate-700 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); navigate(`/projects/${project.id}`); }}
                          >
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {t("dashboard.view_details")}
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-3 font-medium transition-colors"
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setDeleteTarget({ id: project.id, name: project.name }); }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            {t("action.delete")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium truncate">{project.responsable || "—"}</span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    {project.score !== null ? project.score.toFixed(1) : "—"}
                  </div>
                </div>

                {/* Hint: click para ver KPI, botón para ir al detalle */}
                {selectedProject?.id === project.id && (
                  <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between">
                    <span className="text-xs text-indigo-400 font-medium">Vista previa activa</span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                      onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`); }}
                    >
                      Ver detalle
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* KPI Detail */}
        <section className="lg:col-span-2">
          {selectedProject ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedProject.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <StateBadge state={selectedProject.state} />
                    {selectedProject.health_status && (
                      <HealthBadge health_status={selectedProject.health_status as "ok" | "blocked" | "at_risk" | "no_next_step"} />
                    )}
                  </div>
                </div>
                <Link
                  to={`/projects/${selectedProject.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors shrink-0"
                >
                  Ver detalle completo
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estrategia</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">
                    {selectedProject.priority_strategy === "relative" ? "Relativa" : selectedProject.priority_strategy === "absolute" ? "Absoluta" : "Mixta"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Cálculo de priorización</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Prioridad</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{selectedProject.prioridad || "Media"}</p>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Nivel de importancia</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Responsable</p>
                  <p className="text-base font-semibold text-slate-800 mt-1 truncate">{selectedProject.responsable || "—"}</p>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Propietario del proyecto</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Score</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{selectedProject.score?.toFixed(1) ?? "—"}</p>
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.min(((selectedProject.score ?? 0) / SCORE_MAX) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-medium">de {SCORE_MAX} posibles</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedProject.fecha_limite && (
                <div className="mt-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                  <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <div>
                    <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Fecha Límite</p>
                    <p className="text-sm text-rose-800 font-medium mt-0.5">{new Date(selectedProject.fecha_limite).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                </div>
              )}

              {selectedProject.siguiente_paso && (
                <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Siguiente Paso</p>
                    <p className="text-sm text-slate-700 font-medium mt-0.5">{selectedProject.siguiente_paso}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-white rounded-2xl shadow-sm border border-slate-100 border-dashed gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">{t("dashboard.select_project")}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Haz clic en un proyecto de la lista</p>
              </div>
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

      {/* Fix #4: ConfirmDialog reemplaza confirm() nativo */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteProject(deleteTarget.id);
            await fetchProjects();
          }
          setDeleteTarget(null);
        }}
        title="Eliminar proyecto"
        message={`¿Confirmas que deseas eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isDestructive
      />
    </Layout>
  );
}
