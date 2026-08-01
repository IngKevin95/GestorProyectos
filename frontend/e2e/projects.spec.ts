import { test, expect } from '@playwright/test';

test.describe('Projects CRUD', () => {
  test('should create a new project via form UI and verify it appears in the table', async ({ page }) => {
    // Navigate to projects page
    await page.goto('/');

    // Look for a create project button or link (common patterns)
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Try to find and click "Crear Proyecto" button or similar
    const createButton = page.locator('button:has-text("Crear")').first();
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();

    // Fill form fields
    const projectName = 'Test Project E2E';
    const projectResponsible = 'Test User';

    // Fill nombre field
    await page.fill('input[placeholder*="Ej: Diagnóstico"]', projectName);

    // Fill responsable field
    await page.fill('input[placeholder*="Ej: Alice"]', projectResponsible);

    // Select estado (default is usually "Activo", but ensure it's set)
    await page.selectOption('select[name="estado"]', 'Activo');

    // Select tipo de proyecto
    await page.selectOption('select[name="tipo_proyecto"]', 'Proyecto');

    // Submit form - look for submit button (usually labeled "Crear" or "Guardar")
    const submitButton = page.locator('button:has-text("Crear")').last();
    await submitButton.click();

    // Wait for form to close and verify project appears in table
    // The form should close and we should see the new project in the list
    await page.waitForLoadState('networkidle');

    // Verify project name appears in table
    const projectNameCell = page.locator(`text=${projectName}`);
    await expect(projectNameCell).toBeVisible({ timeout: 5000 });

    // Verify responsible appears in table row
    const responsibleCell = page.locator(`text=${projectResponsible}`);
    await expect(responsibleCell).toBeVisible({ timeout: 5000 });

    // Verify estado is displayed correctly (should be "Activo")
    const table = page.locator('table');
    const rows = table.locator('tbody tr');
    const projectRow = rows.filter({
      hasText: new RegExp(`${projectName}.*${projectResponsible}`)
    }).first();

    await expect(projectRow).toBeVisible();

    // Verify status is "Activo" in the table row
    const statusCell = projectRow.locator('text=/Activo|En Pausa|Cancelado|Completado/');
    await expect(statusCell).toContainText('Activo');
  });

  test('should display all required fields correctly after creating a project', async ({ page }) => {
    // Navigate to projects page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify table headers are present
    const headers = page.locator('th');
    await expect(headers).toContainText('Nombre');
    await expect(headers).toContainText('Responsable');
    await expect(headers).toContainText('Estado');
  });
});
