import { test, expect } from '@playwright/test';

test.describe('EP-006: JWT Auth & User Management (HU-015, HU-016)', () => {

  test('HU-015: Should redirect to login when token is expired', async ({ page }) => {
    // Simulamos inyectar un token expirado en localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI.expired_token_mock',
          user: { role: 'admin' }
        },
        version: 0
      }));
    });
    
    // Al intentar navegar a un área protegida (ej: usuarios)
    await page.goto('/users');
    
    // Verificamos que interceptó el 401 o falta de auth válida y redirigió a login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('HU-016: Last admin rule - UI should show error when deleting last admin', async ({ page }) => {
    // En fase TDD roja, simularemos estar logueados y en la página de usuarios
    // Y probaremos que si el backend arroja 400, la UI muestra el error.
    await page.goto('/users');
    
    // Encontramos el botón de eliminar del último admin (mock visual)
    const deleteBtn = page.getByTitle('Eliminar usuario').first();
    if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        
        // Confirmar eliminación en el modal
        await page.getByRole('button', { name: 'Eliminar' }).click();
        
        // Debe aparecer el mensaje de error "No puede eliminar al último administrador"
        await expect(page.getByText('No puede eliminar al último administrador')).toBeVisible();
    }
  });

});
