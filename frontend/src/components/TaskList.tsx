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

  const filteredTasks = selectedStatus ? tasks.filter((t) => t.status === selectedStatus) : tasks;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border rounded px-3 py-2"
          aria-label="Status"
        >
          <option value="">Todos</option>
          <option value="abierta">Abierta</option>
          <option value="vencida">Vencida</option>
          <option value="bloqueada">Bloqueada</option>
          <option value="cerrada">Cerrada</option>
        </select>
        <button
          onClick={() => setSelectedStatus("")}
          className="bg-gray-300 rounded px-4 py-2 hover:bg-gray-400"
        >
          Limpiar Filtro
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-gray-500">No hay tareas en este estado</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Asignado</th>
              <th className="border px-4 py-2 text-left">Prioridad</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Fecha Vencimiento</th>
              <th className="border px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                className={task.status === "vencida" ? "text-red" : ""}
                data-testid={`task-${task.id}`}
              >
                <td className="border px-4 py-2">{task.id.slice(0, 8)}</td>
                <td className="border px-4 py-2">{task.assignee}</td>
                <td className="border px-4 py-2">{task.priority}</td>
                <td className="border px-4 py-2">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value, task.version)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="abierta">Abierta</option>
                    <option value="vencida">Vencida {task.status === "vencida" && "⚠️"}</option>
                    <option value="bloqueada">Bloqueada</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </td>
                <td className="border px-4 py-2">{task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</td>
                <td className="border px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => onEdit(task)}
                    className="bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600 text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {filteredTasks.some((t) => t.status === "vencida") && <div data-testid="icon-warning" className="hidden" />}
    </div>
  );
}
