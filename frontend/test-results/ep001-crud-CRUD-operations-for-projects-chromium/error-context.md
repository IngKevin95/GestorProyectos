# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ep001-crud.spec.ts >> CRUD operations for projects
- Location: e2e\ep001-crud.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Crear")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e8]: G
    - heading "GestorProyectos" [level=2] [ref=e10]
    - paragraph [ref=e11]: Sistema de gestión de proyectos operativo
    - generic [ref=e12]: Vista única del estado de la cartera
    - generic [ref=e15]: Detección automática de riesgos y bloqueos
    - generic [ref=e18]: Priorización de atención diaria
  - generic [ref=e22]:
    - generic [ref=e23]:
      - heading "Bienvenido" [level=1] [ref=e24]
      - paragraph [ref=e25]: Sistema de gestión de proyectos operativo
    - generic [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]: Correo electrónico
        - textbox "Correo electrónico" [ref=e29]:
          - /placeholder: usuario@empresa.com
      - generic [ref=e30]:
        - generic [ref=e31]: Contraseña
        - textbox "Contraseña" [ref=e32]:
          - /placeholder: ••••••••
      - button "Iniciar Sesión" [ref=e33] [cursor=pointer]
    - paragraph [ref=e34]: © 2026 Aztec
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('CRUD operations for projects', async ({ page }) => {
  4  |   await page.goto('/projects');
  5  |   
  6  |   // Step 3: Create with missing fields check
> 7  |   await page.click('button:has-text("Crear")');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  8  |   await expect(page.locator('label', { hasText: 'Total Effort' })).toBeVisible();
  9  |   await expect(page.locator('label', { hasText: 'Priority Strategy' })).toBeVisible();
  10 |   await expect(page.locator('label', { hasText: 'Priority Constant' })).toBeVisible();
  11 |   await expect(page.locator('label', { hasText: 'Business Value' })).toBeVisible();
  12 |   
  13 |   // Step 7: Update with missing fields
  14 |   await page.click('button:has-text("Editar Proyecto")');
  15 |   await page.fill('input[name="total_effort"]', '100');
  16 |   await page.fill('input[name="priority_strategy"]', 'High');
  17 |   await page.fill('input[name="priority_constant"]', '2');
  18 |   await page.fill('input[name="business_value"]', '500');
  19 |   await page.click('button:has-text("Guardar Cambios")');
  20 | });
  21 | 
```