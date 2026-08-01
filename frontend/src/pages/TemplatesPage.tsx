/**
 * TemplatesPage — CRUD de plantillas de proyecto con fases y departamentos predefinidos.
 * Admin only.
 */
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { showToast } from "../components/ui";
import * as svc from "../services/apiService";
import type { ProjectTemplate, TemplatePhase } from "../types";

export function TemplatesPage() {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setTemplates(await svc.getTemplates());
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la plantilla "${name}"?`)) return;
    try {
      await svc.deleteTemplate(id);
      showToast("Plantilla eliminada", "success");
      load();
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-600 shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plantillas de Proyecto</h1>
              <p className="text-sm text-gray-500">Crea plantillas con fases y departamentos predefinidos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-sm rounded-xl text-white font-bold transition-all bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            + Nueva Plantilla
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "#4f46e5", borderTopColor: "transparent" }} />
          </div>
        )}

        {!loading && templates.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No hay plantillas aún. Crea la primera.</p>
          </div>
        )}

        <div className="space-y-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              {/* Template header */}
              <div className="flex items-center justify-between p-5">
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}
                >
                  <h3 className="font-semibold text-gray-800">{tpl.name}</h3>
                  {tpl.description && <p className="text-sm text-gray-500 mt-0.5">{tpl.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {(tpl.structure ?? []).length} fases · {(tpl.structure ?? []).reduce((s, p) => s + (p.departments?.length ?? 0), 0)} departamentos
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(tpl.id, tpl.name)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                    title="Eliminar plantilla"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <span className="text-gray-300 text-sm">{expandedId === tpl.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded structure */}
              {expandedId === tpl.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <div className="space-y-3">
                    {(tpl.structure ?? []).map((phase, pi) => (
                      <div key={`${phase.name}-${pi}`} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-700">📂 {phase.name}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{phase.bac_percent}% del BAC</span>
                        </div>
                        {phase.departments && phase.departments.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {phase.departments.map((dept, di) => (
                              <div key={`${dept.name}-${di}`} className="flex items-center justify-between text-sm text-gray-600 py-1">
                                <span>🏢 {dept.name}</span>
                                <span className="text-xs text-gray-400">{dept.bac_percent}% de la fase</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showCreate && <CreateTemplateModal onClose={() => setShowCreate(false)} onCreated={load} />}
      </div>
    </Layout>
  );
}

/* ── Create Template Modal ─────────────────────── */

type PhaseLocal = TemplatePhase & { _id: string };

let _phaseIdCounter = 0;
const nextPhaseId = () => `modal-phase-${_phaseIdCounter++}`;

function updateDeptInPhase(
  phases: PhaseLocal[],
  phaseIdx: number,
  deptIdx: number,
  field: string,
  value: string | number
): PhaseLocal[] {
  return phases.map((p, pi) => {
    if (pi !== phaseIdx) return p;
    return { ...p, departments: p.departments.map((d, di) => di === deptIdx ? { ...d, [field]: value } : d) };
  });
}

function removeDeptInPhase(phases: PhaseLocal[], phaseIdx: number, deptIdx: number): PhaseLocal[] {
  return phases.map((p, pi) => {
    if (pi !== phaseIdx) return p;
    return { ...p, departments: p.departments.filter((_, di) => di !== deptIdx) };
  });
}

function CreateTemplateModal({ onClose, onCreated }: Readonly<{ onClose: () => void; onCreated: () => void }>) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phases, setPhases] = useState<PhaseLocal[]>([
    { _id: nextPhaseId(), name: "", bac_percent: 100, departments: [{ name: "", bac_percent: 100 }] },
  ]);
  const [saving, setSaving] = useState(false);

  const updatePhase = (idx: number, field: string, value: string | number) => {
    setPhases((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const addPhase = () => {
    setPhases((prev) => [...prev, { _id: nextPhaseId(), name: "", bac_percent: 0, departments: [{ name: "", bac_percent: 100 }] }]);
  };

  const removePhase = (idx: number) => {
    setPhases((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateDept = (phaseIdx: number, deptIdx: number, field: string, value: string | number) => {
    setPhases((prev) => updateDeptInPhase(prev, phaseIdx, deptIdx, field, value));
  };

  const addDept = (phaseIdx: number) => {
    setPhases((prev) => prev.map((p, pi) => {
      if (pi !== phaseIdx) return p;
      return { ...p, departments: [...p.departments, { name: "", bac_percent: 0 }] };
    }));
  };

  const removeDept = (phaseIdx: number, deptIdx: number) => {
    setPhases((prev) => removeDeptInPhase(prev, phaseIdx, deptIdx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phases.some((p) => !p.name.trim())) {
      showToast("Completa el nombre de la plantilla y todas las fases", "error");
      return;
    }
    setSaving(true);
    try {
      await svc.createTemplate({ name: name.trim(), description: description.trim() || undefined, structure: phases.map(({ _id: _unused, ...rest }) => rest) });
      showToast("Plantilla creada", "success");
      onCreated();
      onClose();
    } catch {
      showToast("Error al crear la plantilla", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Nueva Plantilla de Proyecto</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la plantilla</label>
            <input
              id="template-name"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Desarrollo de Software" required
            />
          </div>
          <div>
            <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input
              id="template-description"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción breve de la plantilla"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700">Fases</h4>
              <button type="button" onClick={addPhase} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">+ Agregar fase</button>
            </div>

            {phases.map((phase, pi) => (
              <div key={phase._id} className="border rounded-lg p-4 mb-3 bg-gray-50">
                <div className="flex gap-2 items-end mb-3">
                  <div className="flex-1">
                    <label htmlFor={`phase-name-${pi}`} className="block text-xs text-gray-500 mb-1">Nombre de la fase</label>
                    <input
                      id={`phase-name-${pi}`}
                      className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      value={phase.name} onChange={(e) => updatePhase(pi, "name", e.target.value)} placeholder="Ej: Análisis" required
                    />
                  </div>
                  <div className="w-24">
                    <label htmlFor={`phase-bac-${pi}`} className="block text-xs text-gray-500 mb-1">% BAC</label>
                    <input
                      id={`phase-bac-${pi}`}
                      type="number" min={1} max={100}
                      className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      value={phase.bac_percent} onChange={(e) => updatePhase(pi, "bac_percent", Number(e.target.value))}
                    />
                  </div>
                  {phases.length > 1 && (
                    <button type="button" onClick={() => removePhase(pi)} className="text-red-400 hover:text-red-600 p-1" title="Eliminar fase">✕</button>
                  )}
                </div>

                {/* Departments within phase */}
                <div className="ml-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Departamentos</span>
                    <button type="button" onClick={() => addDept(pi)} className="text-xs text-indigo-600 hover:underline">+ Departamento</button>
                  </div>
                  {phase.departments.map((dept, di) => (
                    <div key={`${pi}-dept-${di}`} className="flex gap-2 items-center">
                      <input
                        aria-label={`Nombre departamento ${di + 1} fase ${pi + 1}`}
                        className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        value={dept.name} onChange={(e) => updateDept(pi, di, "name", e.target.value)} placeholder="Ej: Frontend" required
                      />
                      <input
                        aria-label={`Porcentaje BAC departamento ${di + 1} fase ${pi + 1}`}
                        type="number" min={1} max={100} className="w-20 border rounded px-2 py-1 text-sm"
                        value={dept.bac_percent} onChange={(e) => updateDept(pi, di, "bac_percent", Number(e.target.value))}
                      />
                      <span className="text-xs text-gray-400">%</span>
                      {phase.departments.length > 1 && (
                        <button type="button" onClick={() => removeDept(pi, di)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0">
            {saving ? "Creando..." : "Crear Plantilla"}
          </button>
        </div>
      </form>
    </div>
  );
}
