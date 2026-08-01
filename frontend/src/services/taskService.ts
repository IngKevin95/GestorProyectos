/**
 * Task API service for EP-004
 */
import { Task } from "../store/taskStore";
import api from "./api";

const API_BASE = "/projects";

export const taskService = {
  async createTask(projectId: string, taskData: Partial<Task>) {
    const { data } = await api.post(`${API_BASE}/${projectId}/tasks`, taskData);
    return data;
  },

  async getTasks(projectId: string, status?: string) {
    const params = status ? { status } : undefined;
    const { data } = await api.get(`${API_BASE}/${projectId}/tasks`, { params });
    // Assuming backend returns { tasks: [] } or just []
    return data.tasks || data || [];
  },

  async getTask(projectId: string, taskId: string) {
    const { data } = await api.get(`${API_BASE}/${projectId}/tasks/${taskId}`);
    return data;
  },

  async updateTask(projectId: string, taskId: string, taskData: Partial<Task>) {
    try {
      const { data } = await api.put(`${API_BASE}/${projectId}/tasks/${taskId}`, taskData);
      return data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error("Version conflict: task was modified by another user");
      }
      throw error;
    }
  },

  async deleteTask(projectId: string, taskId: string) {
    await api.delete(`${API_BASE}/${projectId}/tasks/${taskId}`);
  },
};
