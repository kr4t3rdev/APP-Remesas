import { test, expect, Page } from '@playwright/test';

test.describe('Auth screens responsive layout', () => {
  test.skip(process.env.E2E_RUN !== '1', 'Set E2E_RUN=1 to execute E2E flows');

  async function mockAuthApi(page: Page): Promise<void> {
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      const isApiLikeRequest =
        url.includes('/api/') ||
        url.includes('/auth/') ||
        url.includes('/admin/') ||
        url.includes('/bank-accounts') ||
        url.includes('/subscriptions/licenses');

      if (!isApiLikeRequest) {
        await route.continue();
        return;
      }

      if (url.includes('/auth/register') && method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'User registered successfully' }),
        });
        return;
      }

      if (url.includes('/auth/login') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'e2e-token',
            user: { id: 1, email: 'user@test.com', name: 'Test User', role: 'USER' },
          }),
        });
        return;
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  }

  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page);
  });

  test.describe('WelcomeScreen (/)', () => {
    test('mobile viewport (375px) - renders full-screen gradient layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('XChange$ocial').first()).toBeVisible();
      await expect(page.getByText('Tu gestor de finanzas personales')).toBeVisible();
      await expect(page.getByText('Cambio de divisas')).toBeVisible();
      await expect(page.getByText('Control de transacciones')).toBeVisible();
      await expect(page.getByText('Iniciar Sesión').first()).toBeVisible();
      await expect(page.getByText('Registrarse').first()).toBeVisible();
    });

    test('desktop viewport (1280px) - renders split layout with BrandingPanel', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('XChange$ocial').first()).toBeVisible();
      await expect(page.getByText('Tu gestor de finanzas personales')).toBeVisible();
      await expect(page.getByText('Cambio de divisas')).toBeVisible();
      await expect(page.getByText('Iniciar Sesión').first()).toBeVisible();
      await expect(page.getByText('Registrarse').first()).toBeVisible();
    });

    test('WelcomeScreen: BrandingPanel visible on both mobile and desktop', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(300);
      await expect(page.getByText('XChange$ocial').first()).toBeVisible();

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(300);
      await expect(page.getByText('XChange$ocial').first()).toBeVisible();
    });
  });

  test.describe('LoginScreen (/Login)', () => {
    async function navigateToLogin(page: Page, viewport: { width: number; height: number }): Promise<void> {
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.getByText('Iniciar Sesión').first().click();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible({ timeout: 10_000 });
    }

    test('mobile viewport (375px) - renders mobile layout without BrandingPanel', async ({ page }) => {
      await navigateToLogin(page, { width: 375, height: 812 });

      await expect(page.getByText('Casa de Cambio')).toBeVisible();
      await expect(page.getByText('Inicia sesión para continuar')).toBeVisible();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible();
      await expect(page.getByPlaceholder('••••••••')).toBeVisible();
      await expect(page.getByText('¿Olvidaste tu contraseña?')).toBeVisible();
      await expect(page.getByText('Control de transacciones')).not.toBeVisible();
    });

    test('desktop viewport (1280px) - renders split layout with BrandingPanel', async ({ page }) => {
      await navigateToLogin(page, { width: 1280, height: 800 });

      await expect(page.getByText('Ingresa tus credenciales para continuar')).toBeVisible();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible();
      await expect(page.getByPlaceholder('••••••••')).toBeVisible();
      await page.waitForTimeout(800);
      await expect(page.locator('[data-testid="branding-panel"]')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('¿No tienes cuenta?')).toBeVisible();
    });

    test('LoginScreen: BrandingPanel hidden on mobile, visible on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.getByText('Iniciar Sesión').first().click();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('Casa de Cambio')).toBeVisible();
      await expect(page.locator('[data-testid="branding-panel"]')).not.toBeVisible();

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid="branding-panel"]')).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe('RegisterScreen (/Register)', () => {
    test.skip(
      true,
      'React Navigation has no linking config — /Register URL does not navigate to RegisterScreen. ' +
      'Add linking prop to NavigationContainer in AppNavigator.tsx to enable URL routing.',
    );
  });

  test.describe('VerificationPendingScreen (/VerificationPending)', () => {
    test.skip(
      true,
      'React Navigation has no linking config — /VerificationPending URL does not navigate to VerificationPendingScreen. ' +
      'Add linking prop to NavigationContainer in AppNavigator.tsx to enable URL routing.',
    );
  });

  test.describe('ForgotPasswordScreen (/ForgotPassword)', () => {
    test.skip(true, 'ForgotPasswordScreen is not registered in AuthStackNavigator — only Welcome, Login, Register, VerificationPending, and ChangePassword exist.');
  });
});
