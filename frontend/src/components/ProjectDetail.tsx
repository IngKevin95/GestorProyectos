import type { Project } from "../types";
import { Modal } from "./Modal";

interface ProjectDetailProps {
  isOpen: boolean;
  project: Project | null;
  isLoading?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
}

const estadoColor: Record<string, string> = {
  Activo: "bg-green-100 text-green-800",
  "En Pausa": "bg-yellow-100 text-yellow-800",
  Cancelado: "bg-red-100 text-red-800",
  Completado: "bg-slate-100 text-slate-800",
};

const prioridadColor: Record<string, string> = {
  Alta: "bg-red-100 text-red-800",
  Media: "bg-yellow-100 text-yellow-800",
  Baja: "bg-green-100 text-green-800",
};

export function ProjectDetail({ isOpen, project, isLoading, onClose, onEdit, onDelete }: ProjectDetailProps) {
  if (!project) return null;

  const handleDelete = async () => {
    if (onDelete && window.confirm("¿Estás seguro?")) {
      await onDelete();
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={project.name || ""}>
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header con badges */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
            <div className="flex gap-2 flex-wrap">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${estadoColor[project.estado || ""] || "bg-slate-100 text-slate-800"}`}>
                {project.estado}
              </span>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${prioridadColor[project.prioridad] || "bg-slate-100 text-slate-800"}`}>
                {project.prioridad}
              </span>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                {project.tipo_proyecto}
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="space-y-4 border-t border-slate-200 pt-6">
            {/* Responsable */}
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Responsable</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{project.responsable}</p>
            </div>

            {/* Fecha Límite */}
            {project.fecha_límite && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fecha Límite</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {new Date(project.fecha_límite).toLocaleDateString("es-ES")}
                </p>
              </div>
            )}

            {/* Siguiente Paso */}
            {project.siguiente_paso && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Siguiente Paso</p>
                <p className="text-sm text-slate-700 mt-1">{project.siguiente_paso}</p>
              </div>
            )}

            {/* Bloqueos */}
            {project.bloqueos && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bloqueos</p>
                <p className="text-sm text-slate-700 mt-1 bg-red-50 p-3 rounded border border-red-200">{project.bloqueos}</p>
              </div>
            )}

            {/* Notas */}
            {project.notas && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notas</p>
                <p className="text-sm text-slate-700 mt-1 bg-slate-50 p-3 rounded border border-slate-200">{project.notas}</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="border-t border-slate-200 pt-4 space-y-1 text-xs text-slate-500">
            {project.created_at && (
              <p>Creado: {new Date(project.created_at).toLocaleString("es-ES")}</p>
            )}
            {project.updated_at && (
              <p>Actualizado: {new Date(project.updated_at).toLocaleString("es-ES")}</p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cerrar
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
