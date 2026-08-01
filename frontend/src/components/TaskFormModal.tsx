import React, { useState, useEffect } from "react";
import { Task } from "../store/taskStore";
import { taskService } from "../services/taskService";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">{task ? "Editar Tarea" : "Nueva Tarea"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full border rounded px-3 py-2 ${errors.title ? "error border-red-500" : ""}`}
              aria-label="Title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Asignado</label>
            <input
              type="text"
              value={formData.assignee || ""}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className={`w-full border rounded px-3 py-2 ${errors.assignee ? "error border-red-500" : ""}`}
              aria-label="Assignee"
            />
            {errors.assignee && <p className="text-red-500 text-xs mt-1">{errors.assignee}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prioridad</label>
            <select
              value={formData.priority || "media"}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full border rounded px-3 py-2"
              aria-label="Priority"
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={formData.status || "abierta"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="abierta">Abierta</option>
              <option value="vencida">Vencida</option>
              <option value="bloqueada">Bloqueada</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">
              Guardar
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 rounded px-4 py-2 hover:bg-gray-400">
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
