/**
 * Tests for TaskList component (HU-011)
 * RED phase: Write failing tests first
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TaskList from "../TaskList";

describe("TaskList (HU-011)", () => {
  const mockTasks = [
    {
      id: "task-1",
      title: "Open Task 1",
      assignee: "Alice",
      priority: "alta",
      status: "abierta",
      due_date: "2026-08-10T00:00:00",
      version: 1,
    },
    {
      id: "task-2",
      title: "Open Task 2",
      assignee: "Bob",
      priority: "media",
      status: "abierta",
      due_date: "2026-08-08T00:00:00",
      version: 1,
    },
    {
      id: "task-3",
      title: "Overdue Task",
      assignee: "Charlie",
      priority: "alta",
      status: "vencida",
      due_date: "2026-07-31T00:00:00",
      version: 1,
    },
    {
      id: "task-4",
      title: "Blocked Task",
      assignee: "David",
      priority: "baja",
      status: "bloqueada",
      due_date: "2026-08-05T00:00:00",
      version: 1,
    },
    {
      id: "task-5",
      title: "Closed Task",
      assignee: "Eve",
      priority: "media",
      status: "cerrada",
      due_date: "2026-07-25T00:00:00",
      version: 1,
    },
  ];

  const defaultProps = {
    projectId: "test-project-id",
    tasks: mockTasks,
    onStatusChange: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onStatusChange.mockClear();
    defaultProps.onEdit.mockClear();
    defaultProps.onDelete.mockClear();
  });

  describe("AC1: View complete task list", () => {
    it("renders all tasks without filter", () => {
      render(<TaskList {...defaultProps} />);

      expect(screen.getByText("Open Task 1")).toBeInTheDocument();
      expect(screen.getByText("Open Task 2")).toBeInTheDocument();
      expect(screen.getByText("Overdue Task")).toBeInTheDocument();
      expect(screen.getByText("Blocked Task")).toBeInTheDocument();
      expect(screen.getByText("Closed Task")).toBeInTheDocument();
    });

    it("displays table with required columns", () => {
      render(<TaskList {...defaultProps} />);

      // Check for table headers
      expect(screen.getByText(/ID|id/i)).toBeInTheDocument();
      expect(screen.getByText(/Assignee|Asignado/i)).toBeInTheDocument();
      expect(screen.getByText(/Priority|Prioridad/i)).toBeInTheDocument();
      expect(screen.getByText(/Status|Estado/i)).toBeInTheDocument();
      expect(screen.getByText(/Due Date|Fecha Vencimiento/i)).toBeInTheDocument();
    });

    it("shows all task rows in table", () => {
      render(<TaskList {...defaultProps} />);

      const rows = screen.getAllByRole("row");
      // +1 for header row
      expect(rows.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("AC2: Filter by status 'abierta'", () => {
    it("renders filter dropdown", () => {
      render(<TaskList {...defaultProps} />);

      expect(screen.getByLabelText(/status|estado/i)).toBeInTheDocument();
    });

    it("filters tasks when status is selected", async () => {
      const user = userEvent.setup();
      const { container } = render(<TaskList {...defaultProps} />);

      const statusSelect = screen.getByLabelText(/status|estado/i);
      await user.selectOption(statusSelect, "abierta");

      // Should only show 2 abierta tasks
      expect(screen.getByText("Open Task 1")).toBeInTheDocument();
      expect(screen.getByText("Open Task 2")).toBeInTheDocument();
      expect(screen.queryByText("Overdue Task")).not.toBeInTheDocument();
      expect(screen.queryByText("Blocked Task")).not.toBeInTheDocument();
      expect(screen.queryByText("Closed Task")).not.toBeInTheDocument();
    });

    it("shows filter is applied visually", async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);

      const statusSelect = screen.getByLabelText(/status|estado/i);
      await user.selectOption(statusSelect, "abierta");

      // Status select should show abierta selected
      expect((statusSelect as HTMLSelectElement).value).toBe("abierta");
    });

    it("inline status select for quick state change", async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);

      // Find the first task row and its status select
      const rows = screen.getAllByRole("row");
      const firstTaskRow = rows[1]; // Skip header
      const statusSelect = within(firstTaskRow).getByDisplayValue("abierta");

      await user.selectOption(statusSelect, "bloqueada");

      await waitFor(() => {
        expect(defaultProps.onStatusChange).toHaveBeenCalledWith(
          "task-1",
          "bloqueada",
          1 // version
        );
      });
    });
  });

  describe("AC3: Filter by status 'vencida' with visual indicator", () => {
    it("filters to show only overdue tasks", async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);

      const statusSelect = screen.getByLabelText(/status|estado/i);
      await user.selectOption(statusSelect, "vencida");

      expect(screen.getByText("Overdue Task")).toBeInTheDocument();
      expect(screen.queryByText("Open Task 1")).not.toBeInTheDocument();
    });

    it("shows vencida tasks with red color indicator", async () => {
      const user = userEvent.setup();
      const { container } = render(<TaskList {...defaultProps} />);

      const statusSelect = screen.getByLabelText(/status|estado/i);
      await user.selectOption(statusSelect, "vencida");

      const overdueRow = container.querySelector('[data-testid="task-task-3"]');
      expect(overdueRow).toHaveClass("text-red");
    });

    it("shows warning icon for vencida tasks", async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);

      const statusSelect = screen.getByLabelText(/status|estado/i);
      await user.selectOption(statusSelect, "vencida");

      // Look for warning icon (⚠️ or similar)
      expect(screen.getByTestId("icon-warning")).toBeInTheDocument();
    });
  });

  describe("AC4: Filter with no results", () => {
    it("shows empty message when no tasks match filter", async () => {
      const user = userEvent.setup();
      const { container } = render(<TaskList {...defaultProps} tasks={mockTasks} />);

      // Create filter that yields no results - use empty list props
      const emptyProps = {
        ...defaultProps,
        tasks: [],
      };
      const { rerender } = render(<TaskList {...emptyProps} />);

      const statusSelect = screen.getByLabelText(/status|estado/i);
      await user.selectOption(statusSelect, "completada"); // Non-existent status

      await waitFor(() => {
        expect(screen.getByText(/No hay tareas|No tasks/i)).toBeInTheDocument();
      });
    });

    it("displays clear message when status filter has no matches", () => {
      render(
        <TaskList
          {...defaultProps}
          tasks={[]} // Empty task list
        />
      );

      expect(screen.getByText(/No hay tareas|No tasks|empty/i)).toBeInTheDocument();
    });
  });

  describe("AC5: Clear filter", () => {
    it("renders clear filter button", () => {
      render(<TaskList {...defaultProps} />);

      expect(screen.getByRole("button", { name: /clear|limpiar/i })).toBeInTheDocument();
    });

    it("clears filter and shows all tasks", async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);

      const statusSelect = screen.getByLabelText(/status|estado/i);
      const clearButton = screen.getByRole("button", { name: /clear|limpiar/i });

      // Apply filter
      await user.selectOption(statusSelect, "abierta");
      expect(screen.queryByText("Overdue Task")).not.toBeInTheDocument();

      // Clear filter
      await user.click(clearButton);

      // All tasks visible again
      expect(screen.getByText("Open Task 1")).toBeInTheDocument();
      expect(screen.getByText("Overdue Task")).toBeInTheDocument();
      expect(screen.getByText("Blocked Task")).toBeInTheDocument();
      expect(screen.getByText("Closed Task")).toBeInTheDocument();
    });

    it("resets filter dropdown to all/empty value", async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);

      const statusSelect = screen.getByLabelText(/status|estado/i) as HTMLSelectElement;
      const clearButton = screen.getByRole("button", { name: /clear|limpiar/i });

      // Apply filter
      await user.selectOption(statusSelect, "abierta");
      expect(statusSelect.value).toBe("abierta");

      // Clear
      await user.click(clearButton);

      // Should reset to empty/all
      expect(statusSelect.value).toBe("" || "all");
    });
  });

  describe("Edit and Delete actions", () => {
    it("renders Edit button for each task", () => {
      render(<TaskList {...defaultProps} />);

      const editButtons = screen.getAllByRole("button", { name: /edit|editar/i });
      expect(editButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("calls onEdit when Edit button clicked", async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);

      const editButtons = screen.getAllByRole("button", { name: /edit|editar/i });
      await user.click(editButtons[0]);

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTasks[0]);
    });

    it("renders Delete button for each task", () => {
      render(<TaskList {...defaultProps} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete|eliminar/i });
      expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("calls onDelete when Delete button clicked", async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete|eliminar/i });
      await user.click(deleteButtons[0]);

      expect(defaultProps.onDelete).toHaveBeenCalledWith("task-1");
    });
  });

  describe("Empty list handling", () => {
    it("renders empty state when no tasks provided", () => {
      render(<TaskList {...defaultProps} tasks={[]} />);

      expect(screen.getByText(/No hay tareas|No tasks|empty/i)).toBeInTheDocument();
    });

    it("still shows filter controls when empty", () => {
      render(<TaskList {...defaultProps} tasks={[]} />);

      expect(screen.getByLabelText(/status|estado/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear|limpiar/i })).toBeInTheDocument();
    });
  });
});
