/* Audit Store — audit trail for a project. */
import { create } from "zustand";
import type { AuditLogEntry } from "../types";
import * as svc from "../services/apiService";

interface AuditState {
  entries: AuditLogEntry[];
  isLoading: boolean;
  error: string | null;
  loadAudit: (projectId: string, entityType?: string) => Promise<void>;
  clearError: () => void;
}

export const useAuditStore = create<AuditState>()((set) => ({
  entries: [],
  isLoading: false,
  error: null,

  loadAudit: async (projectId, entityType) => {
    set({ isLoading: true, error: null });
    try {
      const entries = await svc.getAuditLog(projectId, entityType);
      set({ entries });
    } catch {
      set({ error: "Failed to load audit trail" });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
