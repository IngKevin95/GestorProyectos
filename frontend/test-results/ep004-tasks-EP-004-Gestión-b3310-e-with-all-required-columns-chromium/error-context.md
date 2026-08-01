# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ep004-tasks.spec.ts >> EP-004: Gestión de Tareas por Proyecto >> should display tasks in a table with all required columns
- Location: e2e\ep004-tasks.spec.ts:74:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Crear")').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button:has-text("Crear")').first()

```

```yaml
- text: G
- heading "GestorProyectos" [level=2]
- paragraph: Sistema de gestión de proyectos operativo
- text: Vista única del estado de la cartera Detección automática de riesgos y bloqueos Priorización de atención diaria
- heading "Bienvenido" [level=1]
- paragraph: Sistema de gestión de proyectos operativo
- text: Correo electrónico
- textbox "Correo electrónico":
  - /placeholder: usuario@empresa.com
- text: Contraseña
- textbox "Contraseña":
  - /placeholder: ••••••••
- button "Iniciar Sesión"
- paragraph: © 2026 Kevin Orduz
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('EP-004: Gestión de Tareas por Proyecto', () => {
  4   |   let projectId: string;
  5   | 
  6   |   test.beforeEach(async ({ page }) => {
  7   |     // Navigate to home and create a test project first
  8   |     await page.goto('http://localhost:3000/');
  9   |     await page.waitForLoadState('networkidle');
  10  | 
  11  |     // Find and click create project button
  12  |     const createButton = page.locator('button:has-text("Crear")').first();
> 13  |     await expect(createButton).toBeVisible({ timeout: 5000 });
      |                                ^ Error: expect(locator).toBeVisible() failed
  14  |     await createButton.click();
  15  | 
  16  |     // Fill form
  17  |     const timestamp = Date.now();
  18  |     const projectName = `EP-004 Test Project ${timestamp}`;
  19  | 
  20  |     await page.fill('input[placeholder*="Ej: Diagnóstico"]', projectName);
  21  |     await page.fill('input[placeholder*="Ej: Alice"]', 'Test User');
  22  |     await page.selectOption('select[name="estado"]', 'Activo');
  23  |     await page.selectOption('select[name="tipo_proyecto"]', 'Proyecto');
  24  | 
  25  |     // Submit and wait for project to be created
  26  |     const submitButton = page.locator('button:has-text("Crear")').last();
  27  |     await submitButton.click();
  28  |     await page.waitForLoadState('networkidle');
  29  | 
  30  |     // Extract project ID from URL or wait for table update
  31  |     await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 5000 });
  32  |   });
  33  | 
  34  |   test('should create a new task for a project', async ({ page }) => {
  35  |     // Navigate to projects list
  36  |     await page.goto('http://localhost:3000/');
  37  |     await page.waitForLoadState('networkidle');
  38  | 
  39  |     // Find first project and click to view details
  40  |     const projectRow = page.locator('table tbody tr').first();
  41  |     await projectRow.click();
  42  |     await page.waitForLoadState('networkidle');
  43  | 
  44  |     // Look for "Add Task" or "Nueva Tarea" button
  45  |     const addTaskButton = page.locator('button:has-text("Nueva Tarea"), button:has-text("Crear Tarea"), button:has-text("Add Task")').first();
  46  | 
  47  |     if (await addTaskButton.isVisible({ timeout: 2000 }).catch(() => false)) {
  48  |       await addTaskButton.click();
  49  | 
  50  |       // Fill task form
  51  |       const taskTitle = `Test Task ${Date.now()}`;
  52  |       await page.fill('input[placeholder*="Título"], input[name="title"]', taskTitle);
  53  |       await page.fill('input[placeholder*="Asignado"], input[name="assignee"]', 'Task Owner');
  54  |       await page.selectOption('select[name="priority"], select[name="estado"]', 'alta');
  55  | 
  56  |       // Set due date if available
  57  |       const dueDate = page.locator('input[type="date"], input[name="due_date"]');
  58  |       if (await dueDate.isVisible({ timeout: 1000 }).catch(() => false)) {
  59  |         const tomorrow = new Date();
  60  |         tomorrow.setDate(tomorrow.getDate() + 1);
  61  |         await dueDate.fill(tomorrow.toISOString().split('T')[0]);
  62  |       }
  63  | 
  64  |       // Submit task
  65  |       const taskSubmitButton = page.locator('button:has-text("Guardar"), button:has-text("Crear")').last();
  66  |       await taskSubmitButton.click();
  67  |       await page.waitForLoadState('networkidle');
  68  | 
  69  |       // Verify task appears in list
  70  |       await expect(page.locator(`text=${taskTitle}`)).toBeVisible({ timeout: 5000 });
  71  |     }
  72  |   });
  73  | 
  74  |   test('should display tasks in a table with all required columns', async ({ page }) => {
  75  |     // Navigate to projects
  76  |     await page.goto('http://localhost:3000/');
  77  |     await page.waitForLoadState('networkidle');
  78  | 
  79  |     // Click first project
  80  |     const projectRow = page.locator('table tbody tr').first();
  81  |     await projectRow.click();
  82  |     await page.waitForLoadState('networkidle');
  83  | 
  84  |     // Verify tasks table exists with required columns
  85  |     const tasksTable = page.locator('table, [role="table"]').nth(1).or(page.locator('table').nth(1));
  86  | 
  87  |     if (await tasksTable.isVisible({ timeout: 2000 }).catch(() => false)) {
  88  |       // Check for common column headers
  89  |       const headers = await page.locator('th, [role="columnheader"]').allTextContents();
  90  |       const headerText = headers.join(' ').toLowerCase();
  91  | 
  92  |       // Should have columns for: ID, Title, Assignee, Priority, Status, Due Date
  93  |       expect(headerText).toContain('asignado');
  94  |       expect(headerText).toContain('prioridad');
  95  |     }
  96  |   });
  97  | 
  98  |   test('should filter tasks by status', async ({ page }) => {
  99  |     // Navigate to project detail
  100 |     await page.goto('http://localhost:3000/');
  101 |     await page.waitForLoadState('networkidle');
  102 | 
  103 |     // Click first project
  104 |     const projectRow = page.locator('table tbody tr').first();
  105 |     await projectRow.click();
  106 |     await page.waitForLoadState('networkidle');
  107 | 
  108 |     // Look for filter controls
  109 |     const filterSelect = page.locator('select[name="status"], select[name="estado"]').first();
  110 | 
  111 |     if (await filterSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
  112 |       // Apply filter
  113 |       await filterSelect.selectOption('abierta');
```