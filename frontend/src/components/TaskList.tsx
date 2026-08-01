import React, { useState } from "react";
import { Task } from "../store/taskStore";

interface TaskListProps {
  projectId: string;
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string, version: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskList({ projectId, tasks, onStatusChange, onEdit, onDelete }: TaskListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = selectedStatus ? safeTasks.filter((t) => t.status === selectedStatus) : safeTasks;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-slate-200 text-sm text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          aria-label="Status"
        >
          <option value="">Todos los estados</option>
          <option value="abierta">Abierta</option>
          <option value="vencida">Vencida</option>
          <option value="bloqueada">Bloqueada</option>
          <option value="cerrada">Cerrada</option>
        </select>
        {selectedStatus && (
          <button
            onClick={() => setSelectedStatus("")}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Limpiar Filtro
          </button>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-gray-500">No hay tareas en este estado</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Asignado</th>
                <th className="px-4 py-3">Prioridad</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha Venc.</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className={`group transition-colors hover:bg-slate-50 ${task.status === "vencida" ? "bg-red-50/30" : ""}`}
                  data-testid={`task-${task.id}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{task.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{task.title}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700 capitalize">{task.priority}</td>
                  <td className="px-4 py-3">
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value, task.version)}
                      className="text-xs font-medium border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 cursor-pointer bg-white"
                    >
                      <option value="abierta">Abierta</option>
                      <option value="vencida">Vencida</option>
                      <option value="bloqueada">Bloqueada</option>
                      <option value="cerrada">Cerrada</option>
                    </select>
                    {task.status === "vencida" && <span className="ml-2 text-xs" title="Vencida">⚠️</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{task.due_date ? new Date(task.due_date).toLocaleDateString() : "\u2014"}</td>
                  <td className="px-4 py-3 text-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(task)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-2 py-1 rounded hover:bg-indigo-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTasks.some((t) => t.status === "vencida") && <div data-testid="icon-warning" className="hidden" />}
    </div>
  );
}
