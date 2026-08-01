import React, { useState, useEffect } from "react";
import { Task } from "../store/taskStore";
import { taskService } from "../services/taskService";
import { useAdminStore } from "../store/adminStore";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  projectId: string;
  task?: Task | null;
}

export default function TaskFormModal({ isOpen, onClose, onSave, projectId, task }: TaskFormModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    assignee: "",
    priority: "media",
    status: "abierta",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { users, fetchUsers } = useAdminStore();

  useEffect(() => {
    if (isOpen && users.length === 0) {
      fetchUsers();
    }
  }, [isOpen, users.length, fetchUsers]);

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({ title: "", assignee: "", priority: "media", status: "abierta" });
    }
  }, [task, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title || formData.title.trim() === "") newErrors.title = "Requerido";
    if (formData.title && formData.title.length > 500) newErrors.title = "Máximo 500 caracteres";
    if (!formData.assignee) newErrors.assignee = "Requerido";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      onSave(formData);
      setFormData({ title: "", assignee: "", priority: "media", status: "abierta" });
      setErrors({});
      onClose();
    } catch (error) {
      setErrors({ submit: String(error) });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 mb-5">{task ? "Editar Tarea" : "Nueva Tarea"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Título</label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full border border-slate-200 text-sm text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${errors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              aria-label="Title"
              placeholder="Ej. Revisar informe mensual"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Asignado</label>
            <select
              value={formData.assignee || ""}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className={`w-full border border-slate-200 text-sm text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white ${errors.assignee ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              aria-label="Assignee"
            >
              <option value="">Selecciona un usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.email}>{user.email}</option>
              ))}
              {formData.assignee && !users.find(u => u.email === formData.assignee) && (
                <option value={formData.assignee}>{formData.assignee}</option>
              )}
            </select>
            {errors.assignee && <p className="text-red-500 text-xs mt-1">{errors.assignee}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prioridad</label>
            <select
              value={formData.priority || "media"}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full border border-slate-200 text-sm text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
              aria-label="Priority"
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado</label>
            <select
              value={formData.status || "abierta"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full border border-slate-200 text-sm text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="abierta">Abierta</option>
              <option value="vencida">Vencida</option>
              <option value="bloqueada">Bloqueada</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
          {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
