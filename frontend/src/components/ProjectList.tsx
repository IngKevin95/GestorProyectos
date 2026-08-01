import { useState } from "react";
import type { Project } from "../types";

interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  filters?: { status?: string; responsable?: string };
  onFilterChange?: (filters: { status?: string; responsable?: string }) => void;
  onViewDetail: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onCreateNew?: () => void;
  onInlineEdit?: (id: string, field: string, value: string) => Promise<void>;
}

const ESTADOS = ["Activo", "En Pausa", "Cancelado", "Completado"];

export function ProjectList({
  projects,
  isLoading,
  filters = {},
  onFilterChange,
  onViewDetail,
  onEdit,
  onDelete,
  onCreateNew,
  onInlineEdit,
}: ProjectListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (newFilters: typeof localFilters) => {
    setLocalFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const responsables = Array.from(new Set(projects.map((p) => p.responsable))).sort();

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-10 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Filtros</h3>
          {(localFilters.status || localFilters.responsable) && (
            <button
              onClick={() => handleFilterChange({})}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estado filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Estado</label>
            <select
              value={localFilters.status || ""}
              onChange={(e) => handleFilterChange({ ...localFilters, status: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Responsable filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Responsable</label>
            <select
              value={localFilters.responsable || ""}
              onChange={(e) =>
                handleFilterChange({ ...localFilters, responsable: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              {responsables.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de proyectos */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm font-medium">No hay proyectos que coincidan con el filtro</p>
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Crear Proyecto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Fecha Límite</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{project.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{project.responsable}</td>
                    <td className="px-6 py-4">
                      {onInlineEdit ? (
                        <select
                          value={project.estado}
                          onChange={(e) => onInlineEdit(project.id, "estado", e.target.value)}
                          className="text-xs font-medium bg-blue-50 text-blue-800 border-none rounded-full px-2 py-1 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          {ESTADOS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {project.estado}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {onInlineEdit ? (
                        <select
                          value={project.prioridad}
                          onChange={(e) => onInlineEdit(project.id, "prioridad", e.target.value)}
                          className={`text-xs font-medium border-none rounded-full px-2 py-1 focus:ring-2 cursor-pointer ${
                            project.prioridad === "Alta"
                              ? "bg-red-50 text-red-800 focus:ring-red-500"
                              : project.prioridad === "Media"
                                ? "bg-yellow-50 text-yellow-800 focus:ring-yellow-500"
                                : "bg-green-50 text-green-800 focus:ring-green-500"
                          }`}
                        >
                          {["Alta", "Media", "Baja"].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            project.prioridad === "Alta"
                              ? "bg-red-100 text-red-800"
                              : project.prioridad === "Media"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {project.prioridad}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {project.fecha_límite ? new Date(project.fecha_límite).toLocaleDateString("es-ES") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onViewDetail(project.id)}
                          aria-label={`Ver ${project.name}`}
                          className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => onEdit(project.id)}
                          aria-label={`Editar ${project.name}`}
                          className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(project.id)}
                          aria-label={`Eliminar ${project.name}`}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">¿Eliminar proyecto?</h3>
            <p className="text-slate-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
