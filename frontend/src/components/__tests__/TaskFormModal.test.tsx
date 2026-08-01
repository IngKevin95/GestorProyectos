/**
 * Tests for TaskFormModal component (HU-010)
 * RED phase: Write failing tests first
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TaskFormModal from "../TaskFormModal";

describe("TaskFormModal (HU-010)", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    projectId: "test-project-id",
    task: null, // For create mode
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  describe("AC1: Create task successfully", () => {
    it("renders form with all required fields", () => {
      render(<TaskFormModal {...defaultProps} />);

      expect(screen.getByLabelText(/title|título/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/assignee|asignado/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority|prioridad/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save|guardar/i })).toBeInTheDocument();
    });

    it("submits form with valid data", async () => {
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      // Fill form
      const titleInput = screen.getByLabelText(/title|título/i);
      const assigneeInput = screen.getByLabelText(/assignee|asignado/i);
      const prioritySelect = screen.getByLabelText(/priority|prioridad/i);
      const saveButton = screen.getByRole("button", { name: /save|guardar/i });

      await user.type(titleInput, "Test Task");
      await user.type(assigneeInput, "John Doe");
      await user.selectOption(prioritySelect, "alta");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: "Test Task",
          assignee: "John Doe",
          priority: "alta",
          status: "abierta", // default
        });
      });
    });

    it("closes modal after successful submission", async () => {
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title|título/i);
      const assigneeInput = screen.getByLabelText(/assignee|asignado/i);
      const saveButton = screen.getByRole("button", { name: /save|guardar/i });

      await user.type(titleInput, "Test Task");
      await user.type(assigneeInput, "John");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("updates project.open_tasks counter after creating task", async () => {
      // This test verifies that the parent component receives notification
      // of task creation for counter updates
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/title|título/i), "New Task");
      await user.type(screen.getByLabelText(/assignee|asignado/i), "John");
      await user.click(screen.getByRole("button", { name: /save|guardar/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe("AC3: Validation - missing title", () => {
    it("shows error when title is empty", async () => {
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      const assigneeInput = screen.getByLabelText(/assignee|asignado/i);
      const saveButton = screen.getByRole("button", { name: /save|guardar/i });

      await user.type(assigneeInput, "John");
      await user.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/required|requerido/i)).toBeInTheDocument();
      });
    });

    it("prevents submission when title is missing", async () => {
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      const assigneeInput = screen.getByLabelText(/assignee|asignado/i);
      const saveButton = screen.getByRole("button", { name: /save|guardar/i });

      await user.type(assigneeInput, "John");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });

    it("highlights title field with error state", async () => {
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title|título/i);
      const saveButton = screen.getByRole("button", { name: /save|guardar/i });

      await user.click(saveButton);

      await waitFor(() => {
        expect(titleInput).toHaveClass("error");
      });
    });
  });

  describe("AC5: Title length validation", () => {
    it("rejects title longer than 500 characters", async () => {
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title|título/i) as HTMLInputElement;
      const longTitle = "x".repeat(501);
      const saveButton = screen.getByRole("button", { name: /save|guardar/i });

      await user.type(titleInput, longTitle);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/500|max/i)).toBeInTheDocument();
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });

    it("accepts title with exactly 500 characters", async () => {
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title|título/i);
      const assigneeInput = screen.getByLabelText(/assignee|asignado/i);
      const saveButton = screen.getByRole("button", { name: /save|guardar/i });

      const titleOf500 = "x".repeat(500);
      await user.type(titleInput, titleOf500);
      await user.type(assigneeInput, "John");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it("shows "Máximo 500 caracteres" error message", async () => {
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title|título/i);
      const longTitle = "x".repeat(501);

      await user.type(titleInput, longTitle);
      await user.click(screen.getByRole("button", { name: /save|guardar/i }));

      await waitFor(() => {
        expect(screen.getByText(/máximo 500 caracteres|max.*500/i)).toBeInTheDocument();
      });
    });
  });

  describe("Modal behavior", () => {
    it("closes when close button clicked", async () => {
      const user = userEvent.setup();
      render(<TaskFormModal {...defaultProps} />);

      const closeButton = screen.getByRole("button", { name: /close|cerrar/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("does not render when isOpen is false", () => {
      render(<TaskFormModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByLabelText(/title|título/i)).not.toBeInTheDocument();
    });

    it("clears form after successful submission", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TaskFormModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/title|título/i), "Task 1");
      await user.type(screen.getByLabelText(/assignee|asignado/i), "John");
      await user.click(screen.getByRole("button", { name: /save|guardar/i }));

      // Rerender with modal closed and reopened
      rerender(<TaskFormModal {...defaultProps} isOpen={false} />);
      rerender(<TaskFormModal {...defaultProps} isOpen={true} />);

      const titleInput = screen.getByLabelText(/title|título/i) as HTMLInputElement;
      expect(titleInput.value).toBe("");
    });
  });

  describe("Edit mode", () => {
    it("renders with task data when in edit mode", () => {
      const existingTask = {
        id: "task-1",
        title: "Existing Task",
        assignee: "Alice",
        priority: "alta",
        status: "abierta",
        version: 1,
      };

      render(<TaskFormModal {...defaultProps} task={existingTask} />);

      expect((screen.getByLabelText(/title|título/i) as HTMLInputElement).value).toBe("Existing Task");
      expect((screen.getByLabelText(/assignee|asignado/i) as HTMLInputElement).value).toBe("Alice");
    });

    it("submits with version when editing", async () => {
      const user = userEvent.setup();
      const existingTask = {
        id: "task-1",
        title: "Existing",
        assignee: "Alice",
        priority: "media",
        status: "abierta",
        version: 2,
      };

      render(<TaskFormModal {...defaultProps} task={existingTask} />);

      const titleInput = screen.getByLabelText(/title|título/i);
      await user.clear(titleInput);
      await user.type(titleInput, "Updated");
      await user.click(screen.getByRole("button", { name: /save|guardar/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Updated",
            version: 2,
          })
        );
      });
    });
  });
});
