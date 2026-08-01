import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useProjectStore } from "../store/projectStore";
import { taskService } from "../services/taskService";
import TaskList from "../components/TaskList";
import TaskFormModal from "../components/TaskFormModal";
import type { Task } from "../store/taskStore";
import { showToast } from "../components/ui";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function TasksPage() {
  const { projects, fetchProjects, isLoading: isLoadingProjects } = useProjectStore();
  const { user } = useAuthStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const safeProjects = projects || [];

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    } else if (safeProjects.length > 0) {
      loadAllMyTasks();
    } else {
      setTasks([]);
    }
  }, [selectedProjectId, safeProjects.length]);

  const loadAllMyTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const promises = safeProjects.map(p => taskService.getTasks(p.id).then(tasks => tasks.map((t: any) => ({ ...t, _projectId: p.id, _projectName: p.name }))));
      const results = await Promise.all(promises);
      const allTasks = results.flat();
      
      const myEmail = user?.email;
      const sorted = allTasks.sort((a, b) => {
        if (a.assignee === myEmail && b.assignee !== myEmail) return -1;
        if (a.assignee !== myEmail && b.assignee === myEmail) return 1;
        return 0;
      });
      setTasks(sorted);
    } catch (e) {
      console.error(e);
      showToast("Error al cargar tareas globales", "error");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const loadTasks = async (projectId: string) => {
    setIsLoadingTasks(true);
    try {
      const data = await taskService.getTasks(projectId);
      setTasks(data || []);
    } catch (e) {
      console.error(e);
      showToast("Error al cargar tareas del proyecto", "error");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    // Si estamos editando y viene de la vista global, usar su _projectId
    const pId = (editingTask as any)?._projectId || selectedProjectId;
    if (!pId) {
      showToast("Selecciona un proyecto primero", "error");
      return;
    }
    
    try {
      if (editingTask) {
        await taskService.updateTask(pId, editingTask.id, { ...taskData, version: editingTask.version });
      } else {
        await taskService.createTask(pId, taskData);
      }
      
      if (selectedProjectId) loadTasks(selectedProjectId);
      else loadAllMyTasks();
      
      setShowTaskForm(false);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const pId = (task as any)?._projectId || selectedProjectId;
    if (!pId) return;

    if (window.confirm("¿Estás seguro de eliminar esta tarea?")) {
      try {
        await taskService.deleteTask(pId, taskId);
        if (selectedProjectId) loadTasks(selectedProjectId);
        else loadAllMyTasks();
      } catch (e) {
        showToast("Error al eliminar", "error");
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string, version: number) => {
    const task = tasks.find(t => t.id === taskId);
    const pId = (task as any)?._projectId || selectedProjectId;
    if (!pId) return;

    try {
      await taskService.updateTask(pId, taskId, { status: newStatus as any, version });
      if (selectedProjectId) loadTasks(selectedProjectId);
      else loadAllMyTasks();
    } catch (e) {
      showToast("Error al actualizar estado", "error");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Tareas</h1>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm"
            >
              <option value="">Selecciona un proyecto...</option>
              {safeProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            <button
              type="button"
              disabled={!selectedProjectId}
              className="px-6 py-2.5 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
            >
              Nueva Tarea
            </button>
          </div>
        </div>

        {isLoadingProjects ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : safeProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Sin proyectos disponibles</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Para ver o gestionar tareas, primero debes tener al menos un proyecto creado.
            </p>
            <Link to="/projects" className="text-indigo-600 font-medium hover:text-indigo-700">
              Ir a crear un proyecto &rarr;
            </Link>
          </div>
        ) : isLoadingTasks ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            {!selectedProjectId && (
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Todas las tareas (Mis tareas primero)</h2>
            )}
            <TaskList
              projectId={selectedProjectId}
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEdit={(t) => {
                setEditingTask(t);
                setShowTaskForm(true);
              }}
              onDelete={handleDeleteTask}
            />
          </div>
        )}
      </div>

      <TaskFormModal
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        projectId={selectedProjectId}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </Layout>
  );
}
