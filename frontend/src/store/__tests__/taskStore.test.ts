/**
 * Tests for taskStore (Zustand)
 * RED phase: Write failing tests first
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaskStore } from "../taskStore";

describe("taskStore (Zustand)", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useTaskStore());
    act(() => {
      result.current.setTasks([]);
      result.current.setSelectedStatus("");
      result.current.clearError();
    });
  });

  describe("State initialization", () => {
    it("initializes with empty tasks", () => {
      const { result } = renderHook(() => useTaskStore());
      expect(result.current.tasks).toEqual([]);
    });

    it("initializes with no selected status", () => {
      const { result } = renderHook(() => useTaskStore());
      expect(result.current.selectedStatus).toBe("");
    });

    it("initializes with loading = false", () => {
      const { result } = renderHook(() => useTaskStore());
      expect(result.current.loading).toBe(false);
    });

    it("initializes with no error", () => {
      const { result } = renderHook(() => useTaskStore());
      expect(result.current.error).toBe(null);
    });
  });

  describe("setTasks", () => {
    it("updates tasks in store", () => {
      const { result } = renderHook(() => useTaskStore());

      const tasks = [
        { id: "1", title: "Task 1", status: "abierta", priority: "alta", version: 1 },
        { id: "2", title: "Task 2", status: "vencida", priority: "media", version: 1 },
      ];

      act(() => {
        result.current.setTasks(tasks);
      });

      expect(result.current.tasks).toEqual(tasks);
      expect(result.current.tasks.length).toBe(2);
    });
  });

  describe("addTask", () => {
    it("adds new task to store", () => {
      const { result } = renderHook(() => useTaskStore());

      const newTask = { id: "1", title: "New Task", status: "abierta", priority: "media", version: 1 };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks).toContainEqual(newTask);
      expect(result.current.tasks.length).toBe(1);
    });

    it("appends to existing tasks", () => {
      const { result } = renderHook(() => useTaskStore());

      const task1 = { id: "1", title: "Task 1", status: "abierta", priority: "media", version: 1 };
      const task2 = { id: "2", title: "Task 2", status: "bloqueada", priority: "alta", version: 1 };

      act(() => {
        result.current.addTask(task1);
        result.current.addTask(task2);
      });

      expect(result.current.tasks.length).toBe(2);
      expect(result.current.tasks[0].id).toBe("1");
      expect(result.current.tasks[1].id).toBe("2");
    });
  });

  describe("updateTask", () => {
    it("updates existing task", () => {
      const { result } = renderHook(() => useTaskStore());

      const task = { id: "1", title: "Original", status: "abierta", priority: "media", version: 1 };

      act(() => {
        result.current.addTask(task);
      });

      const updated = { id: "1", title: "Updated", status: "bloqueada", priority: "alta", version: 2 };

      act(() => {
        result.current.updateTask(updated);
      });

      expect(result.current.tasks[0].title).toBe("Updated");
      expect(result.current.tasks[0].status).toBe("bloqueada");
      expect(result.current.tasks[0].version).toBe(2);
    });

    it("preserves other tasks when updating", () => {
      const { result } = renderHook(() => useTaskStore());

      const task1 = { id: "1", title: "Task 1", status: "abierta", priority: "media", version: 1 };
      const task2 = { id: "2", title: "Task 2", status: "bloqueada", priority: "alta", version: 1 };

      act(() => {
        result.current.addTask(task1);
        result.current.addTask(task2);
      });

      const updated = { id: "1", title: "Updated", status: "vencida", priority: "media", version: 2 };

      act(() => {
        result.current.updateTask(updated);
      });

      expect(result.current.tasks.length).toBe(2);
      expect(result.current.tasks[0].title).toBe("Updated");
      expect(result.current.tasks[1].title).toBe("Task 2"); // Unchanged
    });
  });

  describe("deleteTask", () => {
    it("removes task from store", () => {
      const { result } = renderHook(() => useTaskStore());

      const task1 = { id: "1", title: "Task 1", status: "abierta", priority: "media", version: 1 };
      const task2 = { id: "2", title: "Task 2", status: "bloqueada", priority: "alta", version: 1 };

      act(() => {
        result.current.addTask(task1);
        result.current.addTask(task2);
      });

      expect(result.current.tasks.length).toBe(2);

      act(() => {
        result.current.deleteTask("1");
      });

      expect(result.current.tasks.length).toBe(1);
      expect(result.current.tasks[0].id).toBe("2");
    });

    it("does not affect other tasks", () => {
      const { result } = renderHook(() => useTaskStore());

      const tasks = [
        { id: "1", title: "Task 1", status: "abierta", priority: "media", version: 1 },
        { id: "2", title: "Task 2", status: "bloqueada", priority: "alta", version: 1 },
        { id: "3", title: "Task 3", status: "vencida", priority: "baja", version: 1 },
      ];

      act(() => {
        result.current.setTasks(tasks);
      });

      act(() => {
        result.current.deleteTask("2");
      });

      expect(result.current.tasks.length).toBe(2);
      expect(result.current.tasks[0].id).toBe("1");
      expect(result.current.tasks[1].id).toBe("3");
    });
  });

  describe("setSelectedStatus", () => {
    it("updates selected status filter", () => {
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setSelectedStatus("abierta");
      });

      expect(result.current.selectedStatus).toBe("abierta");
    });

    it("can change filter multiple times", () => {
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setSelectedStatus("abierta");
      });
      expect(result.current.selectedStatus).toBe("abierta");

      act(() => {
        result.current.setSelectedStatus("vencida");
      });
      expect(result.current.selectedStatus).toBe("vencida");

      act(() => {
        result.current.setSelectedStatus("cerrada");
      });
      expect(result.current.selectedStatus).toBe("cerrada");
    });
  });

  describe("clearFilter", () => {
    it("resets selected status to empty", () => {
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setSelectedStatus("abierta");
      });
      expect(result.current.selectedStatus).toBe("abierta");

      act(() => {
        result.current.clearFilter();
      });

      expect(result.current.selectedStatus).toBe("");
    });

    it("does not affect tasks", () => {
      const { result } = renderHook(() => useTaskStore());

      const tasks = [
        { id: "1", title: "Task 1", status: "abierta", priority: "media", version: 1 },
        { id: "2", title: "Task 2", status: "vencida", priority: "alta", version: 1 },
      ];

      act(() => {
        result.current.setTasks(tasks);
        result.current.setSelectedStatus("abierta");
      });

      act(() => {
        result.current.clearFilter();
      });

      expect(result.current.tasks).toEqual(tasks); // Unchanged
      expect(result.current.selectedStatus).toBe("");
    });
  });

  describe("setLoading", () => {
    it("sets loading state to true", () => {
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);
    });

    it("sets loading state to false", () => {
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.loading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe("setError / clearError", () => {
    it("sets error message", () => {
      const { result } = renderHook(() => useTaskStore());

      const errorMsg = "Failed to load tasks";

      act(() => {
        result.current.setError(errorMsg);
      });

      expect(result.current.error).toBe(errorMsg);
    });

    it("clears error", () => {
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setError("Some error");
      });
      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("getFilteredTasks", () => {
    it("returns all tasks when no filter selected", () => {
      const { result } = renderHook(() => useTaskStore());

      const tasks = [
        { id: "1", title: "Task 1", status: "abierta", priority: "media", version: 1 },
        { id: "2", title: "Task 2", status: "vencida", priority: "alta", version: 1 },
        { id: "3", title: "Task 3", status: "bloqueada", priority: "baja", version: 1 },
      ];

      act(() => {
        result.current.setTasks(tasks);
      });

      const filtered = result.current.getFilteredTasks();
      expect(filtered).toEqual(tasks);
    });

    it("returns only tasks matching selected status", () => {
      const { result } = renderHook(() => useTaskStore());

      const tasks = [
        { id: "1", title: "Task 1", status: "abierta", priority: "media", version: 1 },
        { id: "2", title: "Task 2", status: "abierta", priority: "alta", version: 1 },
        { id: "3", title: "Task 3", status: "vencida", priority: "baja", version: 1 },
      ];

      act(() => {
        result.current.setTasks(tasks);
        result.current.setSelectedStatus("abierta");
      });

      const filtered = result.current.getFilteredTasks();
      expect(filtered).toHaveLength(2);
      expect(filtered[0].status).toBe("abierta");
      expect(filtered[1].status).toBe("abierta");
    });
  });
});
