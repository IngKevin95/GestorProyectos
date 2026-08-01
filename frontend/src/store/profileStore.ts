/**
 * Profile Store — Zustand store for profile (hourly rate) management.
 */
import { create } from "zustand";
import type { Profile, ProfileCreate, ProfileUpdate } from "../types";
import * as apiService from "../services/apiService";

interface ProfileState {
  profiles: Profile[];
  isLoading: boolean;
  error: string | null;

  fetchProfiles: (includeInactive?: boolean) => Promise<void>;
  createProfile: (payload: ProfileCreate) => Promise<void>;
  updateProfile: (id: string, payload: ProfileUpdate) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  isLoading: false,
  error: null,

  fetchProfiles: async (includeInactive = false) => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await apiService.getProfiles(includeInactive);
      set({ profiles, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: { message?: string } } } };
      set({ error: error?.response?.data?.detail?.message ?? "Failed to load profiles", isLoading: false });
    }
  },

  createProfile: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.createProfile(payload);
      const profiles = await apiService.getProfiles();
      set({ profiles, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: { message?: string } } } };
      const msg = error?.response?.data?.detail?.message ?? "Failed to create profile";
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  updateProfile: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.updateProfile(id, payload);
      const profiles = await apiService.getProfiles();
      set({ profiles, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: { message?: string } } } };
      const msg = error?.response?.data?.detail?.message ?? "Failed to update profile";
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  deleteProfile: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteProfile(id);
      const profiles = await apiService.getProfiles();
      set({ profiles, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: { message?: string } } } };
      const msg = error?.response?.data?.detail?.message ?? "Failed to delete profile";
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
