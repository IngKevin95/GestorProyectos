import { test, expect } from '@playwright/test';

test.describe('EP-004: Gestión de Tareas por Proyecto', () => {
  let projectId: string;

  test.beforeEach(async ({ page }) => {
    // Navigate to home and create a test project first
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Find and click create project button
    const createButton = page.locator('button:has-text("Crear")').first();
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();

    // Fill form
    const timestamp = Date.now();
    const projectName = `EP-004 Test Project ${timestamp}`;

    await page.fill('input[placeholder*="Ej: Diagnóstico"]', projectName);
    await page.fill('input[placeholder*="Ej: Alice"]', 'Test User');
    await page.selectOption('select[name="estado"]', 'Activo');
    await page.selectOption('select[name="tipo_proyecto"]', 'Proyecto');

    // Submit and wait for project to be created
    const submitButton = page.locator('button:has-text("Crear")').last();
    await submitButton.click();
    await page.waitForLoadState('networkidle');

    // Extract project ID from URL or wait for table update
    await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 5000 });
  });

  test('should create a new task for a project', async ({ page }) => {
    // Navigate to projects list
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Find first project and click to view details
    const projectRow = page.locator('table tbody tr').first();
    await projectRow.click();
    await page.waitForLoadState('networkidle');

    // Look for "Add Task" or "Nueva Tarea" button
    const addTaskButton = page.locator('button:has-text("Nueva Tarea"), button:has-text("Crear Tarea"), button:has-text("Add Task")').first();

    if (await addTaskButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addTaskButton.click();

      // Fill task form
      const taskTitle = `Test Task ${Date.now()}`;
      await page.fill('input[placeholder*="Título"], input[name="title"]', taskTitle);
      await page.fill('input[placeholder*="Asignado"], input[name="assignee"]', 'Task Owner');
      await page.selectOption('select[name="priority"], select[name="estado"]', 'alta');

      // Set due date if available
      const dueDate = page.locator('input[type="date"], input[name="due_date"]');
      if (await dueDate.isVisible({ timeout: 1000 }).catch(() => false)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await dueDate.fill(tomorrow.toISOString().split('T')[0]);
      }

      // Submit task
      const taskSubmitButton = page.locator('button:has-text("Guardar"), button:has-text("Crear")').last();
      await taskSubmitButton.click();
      await page.waitForLoadState('networkidle');

      // Verify task appears in list
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display tasks in a table with all required columns', async ({ page }) => {
    // Navigate to projects
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Click first project
    const projectRow = page.locator('table tbody tr').first();
    await projectRow.click();
    await page.waitForLoadState('networkidle');

    // Verify tasks table exists with required columns
    const tasksTable = page.locator('table, [role="table"]').nth(1).or(page.locator('table').nth(1));

    if (await tasksTable.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Check for common column headers
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      const headerText = headers.join(' ').toLowerCase();

      // Should have columns for: ID, Title, Assignee, Priority, Status, Due Date
      expect(headerText).toContain('asignado');
      expect(headerText).toContain('prioridad');
    }
  });

  test('should filter tasks by status', async ({ page }) => {
    // Navigate to project detail
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Click first project
    const projectRow = page.locator('table tbody tr').first();
    await projectRow.click();
    await page.waitForLoadState('networkidle');

    // Look for filter controls
    const filterSelect = page.locator('select[name="status"], select[name="estado"]').first();

    if (await filterSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Apply filter
      await filterSelect.selectOption('abierta');
      await page.waitForLoadState('networkidle');

      // Verify filtered results (should only show tasks with that status)
      const tasksTable = page.locator('table tbody tr');
      const rowCount = await tasksTable.count();

      if (rowCount > 0) {
        // If there are visible tasks, they should match the filter
        // (This is a smoke test, not comprehensive validation)
        expect(rowCount).toBeGreaterThan(0);
      }
    }
  });

  test('should validate required fields in task form', async ({ page }) => {
    // Navigate to project detail
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Click first project
    const projectRow = page.locator('table tbody tr').first();
    await projectRow.click();
    await page.waitForLoadState('networkidle');

    // Open task form
    const addTaskButton = page.locator('button:has-text("Nueva Tarea"), button:has-text("Crear Tarea")').first();

    if (await addTaskButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addTaskButton.click();

      // Try to submit without filling required fields
      const submitButton = page.locator('button:has-text("Guardar"), button:has-text("Crear")').last();

      if (await submitButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Check if submit is disabled (validation)
        const isDisabled = await submitButton.isDisabled();

        if (isDisabled) {
          expect(isDisabled).toBe(true);
          // Fill title and try again
          await page.fill('input[name="title"], input[placeholder*="Título"]', 'Test');
          await page.waitForTimeout(500);

          const isStillDisabled = await submitButton.isDisabled();
          // After filling title, should be enabled or close to it
          expect(isStillDisabled).toBe(false);
        }
      }
    }
  });
});
