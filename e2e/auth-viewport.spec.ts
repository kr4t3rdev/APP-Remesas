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
          body: JSON.stringify({
            message: 'User registered successfully',
          }),
        });
        return;
      }

      if (url.includes('/auth/login') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'e2e-token',
            user: {
              id: 1,
              email: 'user@test.com',
              name: 'Test User',
              role: 'USER',
            },
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

  test.describe('LoginScreen', () => {
    test('mobile viewport (375px) - renders mobile layout without BrandingPanel', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/Login', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Cashflow')).toBeVisible();
      await expect(page.getByText('Inicia sesión para continuar')).toBeVisible();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible();
      await expect(page.getByPlaceholder('••••••••')).toBeVisible();
      await expect(page.getByText('Iniciar Sesión').first()).toBeVisible();
      await expect(page.getByText('¿Olvidaste tu contraseña?')).toBeVisible();
      await expect(page.getByText('Cashflow')).not.toBeVisible();
      await expect(page.getByText('Regístrate').first()).toBeVisible();
    });

    test('desktop viewport (1280px) - renders split layout with BrandingPanel', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/Login', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Iniciar Sesión').first()).toBeVisible();
      await expect(page.getByText('Ingresa tus credenciales para continuar')).toBeVisible();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible();
      await expect(page.getByPlaceholder('••••••••')).toBeVisible();
      await expect(page.getByText('Cashflow')).toBeVisible();
      await expect(page.getByText('Cambio de divisas')).toBeVisible();
      await expect(page.getByText('¿No tienes cuenta?')).toBeVisible();
    });
  });

  test.describe('RegisterScreen', () => {
    test('mobile viewport (375px) - renders mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/Register', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Volver')).toBeVisible();
      await expect(page.getByText('Crear Cuenta')).toBeVisible();
      await expect(page.getByText('Regístrate para comenzar')).toBeVisible();
      await expect(page.getByText('¿Ya tienes una cuenta?')).toBeVisible();
      await expect(page.getByText('Iniciar Sesión').first()).toBeVisible();
      await expect(page.getByText('Cashflow')).not.toBeVisible();
    });

    test('desktop viewport (1280px) - renders split layout with BrandingPanel', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/Register', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Crear Cuenta').first()).toBeVisible();
      await expect(page.getByText('Regístrate para comenzar')).toBeVisible();
      await expect(page.getByText('Cashflow')).toBeVisible();
      await expect(page.getByText('Cambio de divisas')).toBeVisible();
      await expect(page.getByText('¿Ya tienes una cuenta?')).toBeVisible();
    });
  });

  test.describe('WelcomeScreen', () => {
    test('mobile viewport (375px) - renders full-screen gradient layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Cashflow').first()).toBeVisible();
      await expect(page.getByText('Tu gestor de finanzas personales')).toBeVisible();
      await expect(page.getByText('Cambio de divisas')).toBeVisible();
      await expect(page.getByText('Control de transacciones')).toBeVisible();
      await expect(page.getByText('Iniciar Sesión').first()).toBeVisible();
      await expect(page.getByText('Registrarse').first()).toBeVisible();
    });

    test('desktop viewport (1280px) - renders split layout (no BrandingPanel)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Cashflow').first()).toBeVisible();
      await expect(page.getByText('Tu gestor de finanzas personales')).toBeVisible();
      await expect(page.getByText('Cambio de divisas')).toBeVisible();
      await expect(page.getByText('Iniciar Sesión').first()).toBeVisible();
      await expect(page.getByText('Registrarse').first()).toBeVisible();
    });
  });

  test.describe('VerificationPendingScreen', () => {
    test('mobile viewport (375px) - renders mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/VerificationPending?email=test@example.com', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('¡Registro exitoso!')).toBeVisible();
      await expect(page.getByText(/test@example\.com/)).toBeVisible();
      await expect(page.getByText('Tu cuenta está pendiente de activación')).toBeVisible();
      await expect(page.getByText('Contactar por WhatsApp')).toBeVisible();
    });

    test('desktop viewport (1280px) - renders split layout with BrandingPanel', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/VerificationPending?email=test@example.com', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Verificación pendiente')).toBeVisible();
      await expect(page.getByText('Tu cuenta está esperando activación')).toBeVisible();
      await expect(page.getByText('Cashflow')).toBeVisible();
      await expect(page.getByText('Cambio de divisas')).toBeVisible();
    });
  });

  test.describe('BrandingPanel visibility across breakpoints', () => {
    test('LoginScreen: BrandingPanel hidden on mobile, visible on desktop', async ({ page }) => {
      await page.goto('/Login', { waitUntil: 'domcontentloaded' });

      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(300);
      await expect(page.getByText('Cashflow')).toBeVisible();
      const featureOnMobile = page.getByText('Cambio de divisas').first();
      await expect(featureOnMobile).not.toBeVisible();

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(300);
      await expect(page.getByText('Cashflow')).toBeVisible();
      await expect(page.getByText('Cambio de divisas')).toBeVisible();
    });

    test('RegisterScreen: BrandingPanel hidden on mobile, visible on desktop', async ({ page }) => {
      await page.goto('/Register', { waitUntil: 'domcontentloaded' });

      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(300);
      await expect(page.getByText('Volver')).toBeVisible();
      await expect(page.getByText('Cashflow')).not.toBeVisible();

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(300);
      await expect(page.getByText('Cashflow')).toBeVisible();
    });

    test('VerificationPendingScreen: BrandingPanel hidden on mobile, visible on desktop', async ({ page }) => {
      await page.goto('/VerificationPending?email=test@example.com', { waitUntil: 'domcontentloaded' });

      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(300);
      await expect(page.getByText('¡Registro exitoso!')).toBeVisible();
      await expect(page.getByText('Cashflow')).not.toBeVisible();

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(300);
      await expect(page.getByText('Cashflow')).toBeVisible();
    });
  });
});
