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

  async function gotoLogin(page: Page): Promise<void> {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Iniciar sesión' }).first().click();
    await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible();
  }

  async function gotoRegister(page: Page): Promise<void> {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Crear cuenta' }).first().click();
    await expect(page.getByText('Crea tu estación de trabajo.').first()).toBeVisible();
  }

  async function gotoVerificationPending(page: Page): Promise<void> {
    await gotoRegister(page);
    await page.getByPlaceholder('Nombre y apellido').fill('Test User');
    await page.getByPlaceholder('Tu identificador').fill('testuser');
    await page.getByPlaceholder('nombre@casadecambio.com').fill('test@example.com');
    await page.getByPlaceholder('••••••••').first().fill('Password123');
    await page.getByPlaceholder('••••••••').last().fill('Password123');
    await page.getByText('Acepto los términos y condiciones').click();
    await page.getByText('Crear cuenta', { exact: true }).filter({ visible: true }).last().click();
    await expect(page.getByText('¡Registro exitoso!')).toBeVisible();
  }

  test.describe('LoginScreen', () => {
    test('mobile viewport (375px) - renders the shared public auth shell', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await gotoLogin(page);

      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByText('Vuelve a tu mesa operativa.')).toBeVisible();
      await expect(page.getByText('Inicia sesión para continuar')).toBeVisible();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible();
      await expect(page.getByPlaceholder('••••••••')).toBeVisible();
      await expect(page.getByText('Iniciar Sesión').filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText('Crear cuenta').last()).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();
    });

    test('desktop viewport (1280px) - renders the shared public auth shell', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoLogin(page);

      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByText('Vuelve a tu mesa operativa.')).toBeVisible();
      await expect(page.getByText('Iniciar Sesión').filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText('Inicia sesión para continuar')).toBeVisible();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible();
      await expect(page.getByPlaceholder('••••••••')).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();
      await expect(page.getByText('Crear cuenta').last()).toBeVisible();
    });
  });

  test.describe('RegisterScreen', () => {
    test('mobile viewport (375px) - renders the shared public auth shell', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await gotoRegister(page);

      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByText('Crea tu estación de trabajo.')).toBeVisible();
      await expect(page.getByText('Completa tus datos y comienza a ordenar la operación de tu casa de cambio.')).toBeVisible();
      await expect(page.getByText('¿Ya tienes una cuenta?')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();
    });

    test('desktop viewport (1280px) - renders the shared public auth shell', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoRegister(page);

      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByText('Crea tu estación de trabajo.')).toBeVisible();
      await expect(page.getByText('Crear cuenta').last()).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();
      await expect(page.getByText('¿Ya tienes una cuenta?')).toBeVisible();
    });
  });

  test.describe('WelcomeScreen', () => {
    test('mobile viewport (375px) - renders the responsive web landing', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByText('Tu casa de cambio, en una sola estación.')).toBeVisible();
      await expect(page.getByText('FX multicurrency')).toBeVisible();
      await expect(page.getByText('El control empieza cuando ves el día completo.')).toBeVisible();
      await expect(page.getByText('Iniciar sesión').first()).toBeVisible();
      await expect(page.getByText('Crear cuenta').first()).toBeVisible();
    });

    test('desktop viewport (1280px) - renders the full landing hierarchy', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByText('Tu casa de cambio, en una sola estación.')).toBeVisible();
      await expect(page.getByText('FX multicurrency')).toBeVisible();
      await expect(page.getByText('El control empieza cuando ves el día completo.')).toBeVisible();
      await expect(page.getByText('Iniciar sesión').first()).toBeVisible();
      await expect(page.getByText('Crear cuenta').first()).toBeVisible();
    });
  });

  test.describe('VerificationPendingScreen', () => {
    test('mobile viewport (375px) - renders mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await gotoVerificationPending(page);

      await expect(page.getByText('¡Registro exitoso!')).toBeVisible();
      await expect(page.getByText(/test@example\.com/)).toBeVisible();
      await expect(page.getByText('Tu cuenta está pendiente de activación')).toBeVisible();
      await expect(page.getByText('Contactar por WhatsApp')).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();
    });

    test('desktop viewport (1280px) - renders split layout with BrandingPanel', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoVerificationPending(page);

      await expect(page.getByText('Verificación pendiente')).toBeVisible();
      await expect(page.getByText('Tu cuenta está esperando activación')).toBeVisible();
      await expect(page.getByTestId('branding-panel')).toBeVisible();
      await expect(page.getByTestId('branding-panel').getByText('CashFlows', { exact: true })).toBeVisible();
      await expect(page.getByTestId('branding-panel').getByText('Cambio de divisas')).toBeVisible();
    });
  });

  test.describe('BrandingPanel visibility across breakpoints', () => {
    test('LoginScreen: shared public header remains consistent across breakpoints', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await gotoLogin(page);

      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(300);
      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();
    });

    test('RegisterScreen: shared public header remains consistent across breakpoints', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await gotoRegister(page);

      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(300);
      await expect(page.getByRole('button', { name: 'Ir al inicio' })).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();
    });

    test('VerificationPendingScreen: BrandingPanel hidden on mobile, visible on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await gotoVerificationPending(page);

      await expect(page.getByText('¡Registro exitoso!')).toBeVisible();
      await expect(page.getByTestId('branding-panel')).not.toBeVisible();

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(300);
      await expect(page.getByTestId('branding-panel')).toBeVisible();
    });
  });
});
