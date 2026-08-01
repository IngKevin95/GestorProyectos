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

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  selectedKPI: KPIIndicators | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (name: string, bac: number) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project> & { version: number }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjectKPI: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projects: [],
  selectedProject: null,
  selectedKPI: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await svc.getProjects();
      set({ projects: result.data });
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
      set({ selectedProject: result.project, selectedKPI: result.kpi });
    } catch (e) {
      set({ error: extractError(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (name, bac) => {
    const project = await svc.createProject({ name, bac });
    set((s) => ({ projects: [project, ...s.projects] }));
    return project;
  },

  updateProject: async (id, update) => {
    const project = await svc.updateProject(id, update);
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? project : p)),
      selectedProject: s.selectedProject?.id === id ? project : s.selectedProject,
    }));
  },

  deleteProject: async (id) => {
    await svc.deleteProject(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      selectedProject: s.selectedProject?.id === id ? null : s.selectedProject,
    }));
  },

  fetchProjectKPI: async (id) => {
    const kpi = await svc.getProjectKPI(id);
    set({ selectedKPI: kpi });
  },

  clearError: () => set({ error: null }),
}));
