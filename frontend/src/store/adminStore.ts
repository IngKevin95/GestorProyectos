/**
 * Admin Store — Zustand store for user and role management.
 */
import { create } from "zustand";
import type { UserWithStatus, UsersSummary, UserCreate, UserUpdate, Role, RoleCreate, RoleUpdate } from "../types";
import * as apiService from "../services/apiService";

interface AdminState {
  users: UserWithStatus[];
  summary: UsersSummary | null;
  roles: Role[];
  availablePermissions: string[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  createUser: (payload: UserCreate) => Promise<void>;
  updateUser: (id: string, payload: UserUpdate) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  createRole: (payload: RoleCreate) => Promise<void>;
  updateRole: (id: string, payload: RoleUpdate) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  summary: null,
  roles: [],
  availablePermissions: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await apiService.getUsers();
      set({ users, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.detail?.message ?? "Failed to load users", isLoading: false });
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await apiService.getUsersSummary();
      set({ summary });
    } catch {
      /* non-critical */
    }
  },

  createUser: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.createUser(payload);
      const users = await apiService.getUsers();
      const summary = await apiService.getUsersSummary();
      set({ users, summary, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message ?? "Failed to create user";
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  updateUser: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.updateUser(id, payload);
      const users = await apiService.getUsers();
      const summary = await apiService.getUsersSummary();
      set({ users, summary, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message ?? "Failed to update user";
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteUser(id);
      const users = await apiService.getUsers();
      const summary = await apiService.getUsersSummary();
      set({ users, summary, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message ?? err?.response?.data?.detail ?? "Failed to delete user";
      set({ error: typeof msg === 'string' ? msg : "Failed to delete user", isLoading: false });
      throw err;
    }
  },

  fetchRoles: async () => {
    try {
      const roles = await apiService.getRoles();
      set({ roles });
    } catch (err: any) {
      set({ error: err?.response?.data?.detail?.message ?? "Failed to load roles" });
    }
  },

  fetchPermissions: async () => {
    try {
      const availablePermissions = await apiService.getAvailablePermissions();
      set({ availablePermissions });
    } catch {
      /* non-critical */
    }
  },

  createRole: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.createRole(payload);
      const roles = await apiService.getRoles();
      set({ roles, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message ?? "Failed to create role";
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  updateRole: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.updateRole(id, payload);
      const roles = await apiService.getRoles();
      set({ roles, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message ?? "Failed to update role";
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  deleteRole: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteRole(id);
      const roles = await apiService.getRoles();
      set({ roles, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message ?? "Failed to delete role";
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
