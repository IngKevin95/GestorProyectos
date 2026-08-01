/**
 * Project Store — Zustand
 * Proyectos, KPI, loading states.
 */
import { create } from "zustand";
import type { Project, KPIIndicators } from "../types";
import * as svc from "../services/apiService";

function extractError(e: unknown): string {
  const err = e as { response?: { data?: { detail?: { message?: string } } } };
  return err?.response?.data?.detail?.message ?? "Unexpected error";
}

interface ProjectInput {
  name: string;
  responsable: string;
  estado: string;
  prioridad: string;
  fecha_límite?: string;
  siguiente_paso?: string;
  bloqueos?: string;
  notas?: string;
  tipo_proyecto: string;
  bac?: number;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  selectedKPI: KPIIndicators | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    responsable?: string;
  };

  fetchProjects: (filters?: { status?: string; responsable?: string }) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: ProjectInput) => Promise<Project>;
  updateProject: (id: string, data: Partial<ProjectInput>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjectKPI: (id: string) => Promise<void>;
  setFilters: (filters: { status?: string; responsable?: string }) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projects: [],
  selectedProject: null,
  selectedKPI: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchProjects: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const result = await svc.getProjects(50, undefined, filters?.status, filters?.responsable);
      set({ projects: result.data || result });
      if (filters) {
        set({ filters });
      }
    } catch (e) {
      set({ error: extractError(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await svc.getProject(id);
      set({ selectedProject: result.project || result, selectedKPI: result.kpi });
    } catch (e) {
      set({ error: extractError(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (data) => {
    try {
      const project = await svc.createProject(data);
      set((s) => ({ projects: [project, ...s.projects] }));
      return project;
    } catch (e) {
      set({ error: extractError(e) });
      throw e;
    }
  },

  updateProject: async (id, update) => {
    try {
      const project = await svc.updateProject(id, update);
      set((s) => ({
        projects: s.projects.map((p) => (p.id === id ? project : p)),
        selectedProject: s.selectedProject?.id === id ? project : s.selectedProject,
      }));
    } catch (e) {
      set({ error: extractError(e) });
      throw e;
    }
  },

  deleteProject: async (id) => {
    try {
      await svc.deleteProject(id);
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== id),
        selectedProject: s.selectedProject?.id === id ? null : s.selectedProject,
      }));
    } catch (e) {
      set({ error: extractError(e) });
      throw e;
    }
  },

  fetchProjectKPI: async (id) => {
    try {
      const kpi = await svc.getProjectKPI(id);
      set({ selectedKPI: kpi });
    } catch (e) {
      set({ error: extractError(e) });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),
}));
