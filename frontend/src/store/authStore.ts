/**
 * Auth Store — Zustand
 * Maneja tokens JWT, usuario autenticado y estado de carga.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

interface User {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  created_at?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (access: string, refresh: string) => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const { data } = await api.post("/auth/login", { email, password });
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isLoading: false,
        });
        await get().fetchMe();
      },

      logout: () => {
        const refresh = get().refreshToken;
        if (refresh) {
          api.post("/auth/logout", { refresh_token: refresh }).catch(() => {});
        }
        set({ accessToken: null, refreshToken: null, user: null });
      },

      setTokens: (access, refresh) => {
        set({ accessToken: access, refreshToken: refresh });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data });
        } catch {
          set({ user: null });
        }
      },
    }),
    {
      name: "kpi-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
