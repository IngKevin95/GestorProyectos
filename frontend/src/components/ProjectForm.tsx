import { useState } from "react";
import type { Project } from "../types";
import { Modal } from "./Modal";

interface ProjectFormProps {
  open: boolean;
  project?: Project;
  onSubmit: (data: {
    name: string;
    total_effort: number;
    responsable: string;
    estado: string;
    prioridad: string;
    fecha_limite?: string;
    siguiente_paso?: string;
    bloqueos?: string;
    notas?: string;
    tipo_proyecto: string;
    priority_strategy?: string;
    version?: number;
  }) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

const ESTADOS = ["Activo", "En Pausa", "Cancelado", "Completado"];
const PRIORIDADES = ["Alta", "Media", "Baja"];
const TIPOS = ["Mantenimiento", "Recurrente", "Diagnóstico", "Proyecto"];

export function ProjectForm({ open, project, onSubmit, onClose, isLoading }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    nombre: project?.name || "",
    responsable: project?.responsable || "",
    estado: project?.estado || "Activo",
    prioridad: project?.prioridad || "Media",
    fecha_limite: project?.fecha_limite || "",
    siguiente_paso: project?.siguiente_paso || "",
    bloqueos: project?.bloqueos || "",
    notas: project?.notas || "",
    tipo_proyecto: project?.tipo_proyecto || "Proyecto",
    priority_strategy: project?.priority_strategy || "relative",
    priority_constant: project?.priority_constant ?? 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const priorityStrategiesRequiringConstant = ["absolute"];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.responsable.trim()) newErrors.responsable = "El responsable es requerido";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload: any = {
        name: formData.nombre,
        responsable: formData.responsable,
        estado: formData.estado,
        prioridad: formData.prioridad,
        fecha_limite: formData.fecha_limite || undefined,
        siguiente_paso: formData.siguiente_paso || undefined,
        bloqueos: formData.bloqueos || undefined,
        notas: formData.notas || undefined,
        tipo_proyecto: formData.tipo_proyecto,
        priority_strategy: formData.priority_strategy,
      };

      if (!project) {
        payload.total_effort = 100;
      }

      if (project?.version !== undefined) {
        payload.version = project.version;
      }

      if (priorityStrategiesRequiringConstant.includes(formData.priority_strategy)) {
        payload.priority_constant = formData.priority_constant;
      }
      await onSubmit(payload);
      setFormData({
        nombre: "",
        responsable: "",
        estado: "Activo",
        prioridad: "Media",
        fecha_limite: "",
        siguiente_paso: "",
        bloqueos: "",
        notas: "",
        tipo_proyecto: "Proyecto",
        priority_strategy: "relative",
        priority_constant: 50,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? "Editar Proyecto" : "Nuevo Proyecto"} wide>
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">

        {/* ── Sección básica ── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Información básica</p>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre *</label>
            <input
              type="text"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre del proyecto"
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Responsable *</label>
            <input
              type="text"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              value={formData.responsable}
              onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
              placeholder="Nombre del responsable"
            />
            {errors.responsable && <p className="text-red-500 text-xs mt-1 font-medium">{errors.responsable}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Proyecto</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none"
                value={formData.tipo_proyecto}
                onChange={(e) => setFormData({ ...formData, tipo_proyecto: e.target.value })}
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prioridad</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none"
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
              >
                {PRIORIDADES.map((prioridad) => (
                  <option key={prioridad} value={prioridad}>{prioridad}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha Límite</label>
              <input
                type="date"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                value={formData.fecha_limite}
                onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Siguiente Paso</label>
            <input
              type="text"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              value={formData.siguiente_paso}
              onChange={(e) => setFormData({ ...formData, siguiente_paso: e.target.value })}
              placeholder="¿Cuál es el siguiente paso?"
            />
          </div>
        </div>

        {/* ── Sección contexto ── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contexto (opcional)</p>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bloqueos</label>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
              rows={2}
              value={formData.bloqueos}
              onChange={(e) => setFormData({ ...formData, bloqueos: e.target.value })}
              placeholder="¿Hay algo que bloquea este proyecto?"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notas</label>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
              rows={2}
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Notas adicionales"
            />
          </div>
        </div>

        {/* ── Sección avanzada (colapsable) ── */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors w-full"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Configuración avanzada de priorización
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estrategia de Priorización</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none"
                  value={formData.priority_strategy}
                  onChange={(e) => setFormData({ ...formData, priority_strategy: e.target.value })}
                >
                  <option value="relative">Relativa (Urgencia × Valor)</option>
                  <option value="absolute">Absoluta (Fija)</option>
                  <option value="mixed">Mixta (Salud + Urgencia + Valor + Críticas)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Constante de Prioridad</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={!priorityStrategiesRequiringConstant.includes(formData.priority_strategy)}
                  className={`w-full rounded-xl px-4 py-3 text-sm transition-all ${
                    priorityStrategiesRequiringConstant.includes(formData.priority_strategy)
                      ? "bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      : "bg-slate-50 border border-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  value={formData.priority_constant}
                  onChange={(e) => setFormData({ ...formData, priority_constant: parseInt(e.target.value) || 0 })}
                  placeholder="0 – 100"
                />
                <p className="text-xs text-slate-400 mt-1.5 font-medium">
                  {priorityStrategiesRequiringConstant.includes(formData.priority_strategy)
                    ? "Valor fijo de prioridad entre 0 y 100. Solo disponible para estrategia Absoluta."
                    : "Solo disponible cuando la estrategia es Absoluta."}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 text-sm rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isLoading ? "Guardando..." : project ? "Actualizar" : "Crear proyecto"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

        <div>
          <label className="block text-base font-bold text-slate-700 mb-2">Nombre *</label>
          <input
            type="text"
            title="Nombre único del proyecto"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre del proyecto"
          />
          {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-base font-bold text-slate-700 mb-2">Responsable *</label>
          <input
            type="text"
            title="Persona responsable de ejecutar el proyecto"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
            value={formData.responsable}
            onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
            placeholder="Nombre del responsable"
          />
          {errors.responsable && <p className="text-red-500 text-xs mt-1">{errors.responsable}</p>}
        </div>

        <div>
          <label className="block text-base font-bold text-slate-700 mb-2">Estado</label>
          <select
            title="Estado actual del proyecto"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium appearance-none"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
          >
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Prioridad</label>
          <select
            title="Nivel de prioridad (Alta, Media, Baja)"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium appearance-none"
            value={formData.prioridad}
            onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
          >
            {PRIORIDADES.map((prioridad) => (
              <option key={prioridad} value={prioridad}>{prioridad}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Tipo de Proyecto</label>
          <select
            title="Categoría o tipo del proyecto"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium appearance-none"
            value={formData.tipo_proyecto}
            onChange={(e) => setFormData({ ...formData, tipo_proyecto: e.target.value })}
          >
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Estrategia de Priorización</label>
          <select
            title="Método para calcular la prioridad del proyecto"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium appearance-none"
            value={formData.priority_strategy}
            onChange={(e) => setFormData({ ...formData, priority_strategy: e.target.value })}
          >
            <option value="relative">Relativa (Urgencia × Valor)</option>
            <option value="absolute">Absoluta (Fija)</option>
            <option value="mixed">Mixta (Salud + Urgencia + Valor + Críticas)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Constante de Prioridad</label>
          <input
            type="number"
            min="0"
            max="100"
            title="Valor fijo de prioridad (0-100). Solo disponible para estrategia Absoluta"
            disabled={!priorityStrategiesRequiringConstant.includes(formData.priority_strategy)}
            className={`w-full rounded-xl px-4 py-3 transition-all font-medium ${
              priorityStrategiesRequiringConstant.includes(formData.priority_strategy)
                ? "bg-slate-50/50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                : "bg-slate-100/50 border border-slate-200/50 text-slate-400 cursor-not-allowed"
            }`}
            value={formData.priority_constant}
            onChange={(e) => setFormData({ ...formData, priority_constant: parseInt(e.target.value) || 0 })}
            placeholder="0-100"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha Límite</label>
          <input
            type="date"
            title="Fecha de vencimiento o entrega del proyecto"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
            value={formData.fecha_limite}
            onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Siguiente Paso</label>
          <input
            type="text"
            title="Próxima acción o tarea a realizar en el proyecto"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
            value={formData.siguiente_paso}
            onChange={(e) => setFormData({ ...formData, siguiente_paso: e.target.value })}
            placeholder="¿Cuál es el siguiente paso?"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Bloqueos</label>
          <textarea
            title="Impedimentos, dependencias o restricciones del proyecto"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
            rows={2}
            value={formData.bloqueos}
            onChange={(e) => setFormData({ ...formData, bloqueos: e.target.value })}
            placeholder="¿Hay algo que bloquea este proyecto?"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Notas</label>
          <textarea
            title="Información adicional o contexto del proyecto"
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
            rows={2}
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            placeholder="Notas adicionales"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Guardando..." : project ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
