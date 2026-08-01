import { useState } from "react";
import type { Project } from "../types";
import { Modal } from "./Modal";

interface ProjectFormProps {
  open: boolean;
  project?: Project;
  onSubmit: (data: {
    name: string;
    responsable: string;
    status: string;
    prioridad: string;
    fecha_límite?: string;
    siguiente_paso?: string;
    bloqueos?: string;
    notas?: string;
    tipo_proyecto: string;
    total_effort?: number;
    priority_strategy?: string;
    priority_constant?: number;
    business_value?: number;
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
    estado: project?.status || "Activo",
    prioridad: project?.prioridad || "Media",
    fecha_límite: project?.fecha_límite || "",
    siguiente_paso: project?.siguiente_paso || "",
    bloqueos: project?.bloqueos || "",
    notas: project?.notas || "",
    tipo_proyecto: project?.tipo_proyecto || "Proyecto",
    total_effort: (project as any)?.total_effort || 0,
    priority_strategy: project?.priority_strategy || "",
    priority_constant: project?.priority_constant || 0,
    business_value: project?.business_value || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // Map form fields to backend field names: nombre → name, estado → status
      await onSubmit({
        ...formData,
        name: formData.nombre,
        estado: formData.estado,
      } as any);
      setFormData({
        nombre: "",
        responsable: "",
        estado: "Activo",
        prioridad: "Media",
        fecha_límite: "",
        siguiente_paso: "",
        bloqueos: "",
        notas: "",
        tipo_proyecto: "Proyecto",
        total_effort: 0,
        priority_strategy: "",
        priority_constant: 0,
        business_value: 0,
      });
      onClose();
    } catch (error) {
      setErrors({ submit: "Error al guardar el proyecto" });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? "Editar Proyecto" : "Crear Proyecto"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.submit && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{errors.submit}</div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.nombre
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-indigo-500"
            }`}
            placeholder="Ej: Diagnóstico de infraestructura"
          />
          {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
        </div>

        {/* Responsable */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Responsable *</label>
          <input
            type="text"
            name="responsable"
            value={formData.responsable}
            onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.responsable
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-indigo-500"
            }`}
            placeholder="Ej: Alice"
          />
          {errors.responsable && <p className="text-red-600 text-sm mt-1">{errors.responsable}</p>}
        </div>

        {/* Estado y Prioridad */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
            <select
              name="prioridad"
              value={formData.prioridad}
              onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tipo de Proyecto */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Proyecto</label>
          <select
            name="tipo_proyecto"
            value={formData.tipo_proyecto}
            onChange={(e) => setFormData({ ...formData, tipo_proyecto: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha Límite */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Límite</label>
          <input
            type="date"
            name="fecha_límite"
            value={formData.fecha_límite}
            onChange={(e) => setFormData({ ...formData, fecha_límite: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Siguiente Paso */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Siguiente Paso</label>
          <input
            type="text"
            name="siguiente_paso"
            value={formData.siguiente_paso}
            onChange={(e) => setFormData({ ...formData, siguiente_paso: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: Revisar brief con cliente"
          />
        </div>

        {/* Bloqueos */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bloqueos</label>
          <textarea
            name="bloqueos"
            value={formData.bloqueos}
            onChange={(e) => setFormData({ ...formData, bloqueos: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
            placeholder="Ej: Pendiente aprobación presupuesto"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
            placeholder="Notas internas"
          />
        </div>

        {/* Missing Fields */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Effort</label>
          <input
            type="number"
            name="total_effort"
            value={formData.total_effort}
            onChange={(e) => setFormData({ ...formData, total_effort: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority Strategy</label>
          <input
            type="text"
            name="priority_strategy"
            value={formData.priority_strategy}
            onChange={(e) => setFormData({ ...formData, priority_strategy: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority Constant</label>
          <input
            type="number"
            name="priority_constant"
            value={formData.priority_constant}
            onChange={(e) => setFormData({ ...formData, priority_constant: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Business Value</label>
          <input
            type="number"
            name="business_value"
            value={formData.business_value}
            onChange={(e) => setFormData({ ...formData, business_value: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Guardando..." : project ? "Guardar Cambios" : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
