/**
 * Zustand store for task state management (EP-004)
 */
import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: "alta" | "media" | "baja";
  status: "abierta" | "vencida" | "bloqueada" | "cerrada";
  due_date?: string;
  version: number;
  project_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface TaskStore {
  tasks: Task[];
  selectedStatus: string;
  loading: boolean;
  error: string | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  setSelectedStatus: (status: string) => void;
  clearFilter: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getFilteredTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedStatus: "",
  loading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  setSelectedStatus: (status) => set({ selectedStatus: status }),

  clearFilter: () => set({ selectedStatus: "" }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  getFilteredTasks: () => {
    const state = get();
    if (!state.selectedStatus) {
      return state.tasks;
    }
    return state.tasks.filter((task) => task.status === state.selectedStatus);
  },
}));
