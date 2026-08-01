import { test, expect } from '@playwright/test';

test('CRUD operations for projects', async ({ page }) => {
  await page.goto('/projects');
  
  // Step 3: Create with missing fields check
  await page.click('button:has-text("Crear")');
  await expect(page.locator('label', { hasText: 'Total Effort' })).toBeVisible();
  await expect(page.locator('label', { hasText: 'Priority Strategy' })).toBeVisible();
  await expect(page.locator('label', { hasText: 'Priority Constant' })).toBeVisible();
  await expect(page.locator('label', { hasText: 'Business Value' })).toBeVisible();
  
  // Step 7: Update with missing fields
  await page.click('button:has-text("Editar Proyecto")');
  await page.fill('input[name="total_effort"]', '100');
  await page.fill('input[name="priority_strategy"]', 'High');
  await page.fill('input[name="priority_constant"]', '2');
  await page.fill('input[name="business_value"]', '500');
  await page.click('button:has-text("Guardar Cambios")');
});
