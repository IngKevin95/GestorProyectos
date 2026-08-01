/**
 * Task API service for EP-004
 */
import { Task } from "../store/taskStore";

const API_BASE = "/api/v1/projects";

export const taskService = {
  async createTask(projectId: string, taskData: Partial<Task>) {
    const response = await fetch(`${API_BASE}/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error("Failed to create task");
    return response.json();
  },

  async getTasks(projectId: string, status?: string) {
    const url = new URL(`${API_BASE}/${projectId}/tasks`, window.location.origin);
    if (status) url.searchParams.set("status", status);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch tasks");
    const data = await response.json();
    return data.tasks || [];
  },

  async getTask(projectId: string, taskId: string) {
    const response = await fetch(`${API_BASE}/${projectId}/tasks/${taskId}`);
    if (!response.ok) throw new Error("Failed to fetch task");
    return response.json();
  },

  async updateTask(projectId: string, taskId: string, taskData: Partial<Task>) {
    const response = await fetch(`${API_BASE}/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("Version conflict: task was modified by another user");
      }
      throw new Error("Failed to update task");
    }
    return response.json();
  },

  async deleteTask(projectId: string, taskId: string) {
    const response = await fetch(`${API_BASE}/${projectId}/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete task");
  },
};
