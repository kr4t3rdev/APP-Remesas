import { test, expect, type Page } from '@playwright/test';

test.describe('Admin mode and licensing flows', () => {
  test.skip(process.env.E2E_RUN !== '1', 'Set E2E_RUN=1 to execute E2E flows');

  test('5.9 admin can navigate tabs and execute sensitive user control with reason', async ({ page }) => {
    let actionPayload: any = null;

    await mockApiRoutes(page, 'ADMIN', (payload) => {
      actionPayload = payload;
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@cambios.com', process.env.E2E_ADMIN_PASSWORD || 'admin1234');

    await expect(page.getByRole('tab', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Servicios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Usuarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Reportes' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Perfil' })).toBeVisible();

    await page.getByRole('tab', { name: 'Usuarios' }).click();
    await page.getByTestId('admin-user-row-2').click();
    await page.getByTestId('admin-user-action-CHANGE_ROLE').click();
    await page.getByTestId('user-action-reason-input').fill('Escalación temporal para soporte crítico');
    await page.getByText('Confirmar y aplicar').click();

    await expect.poll(() => actionPayload).not.toBeNull();
    expect(actionPayload).toMatchObject({
      actionType: 'CHANGE_ROLE',
      reason: 'Escalación temporal para soporte crítico',
    });
  });

  test('5.9.b admin refresh shows partial warning and keeps home interactive', async ({ page }) => {
    await mockApiRoutes(page, 'ADMIN', undefined, { failAuditLogsOnSecondCall: true });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@cambios.com', process.env.E2E_ADMIN_PASSWORD || 'admin1234');

    await expect(page.getByText('Inicio Admin')).toBeVisible();

    await page.getByTestId('admin-home-refresh-button').click();

    await expect(page.getByText('Datos parciales, intenta actualizar')).toBeVisible();
    await expect(page.getByText('Estado de licencias')).toBeVisible();
    await expect(page.getByText('Eventos operativos recientes')).toBeVisible();
  });

  test('5.9.c admin can navigate to Reportes after a user control action for deep analytics', async ({ page }) => {
    await mockApiRoutes(page, 'ADMIN');

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@cambios.com', process.env.E2E_ADMIN_PASSWORD || 'admin1234');

    await page.getByRole('tab', { name: 'Usuarios' }).click();
    await page.getByTestId('admin-user-row-2').click();
    await page.getByTestId('admin-user-action-UNBLOCK').click();

    await page.getByRole('tab', { name: 'Reportes' }).click();
    await expect(page.getByText('Reportes Admin')).toBeVisible();
    await expect(page.getByText('Analítica extendida para profundizar decisiones operativas de Usuarios')).toBeVisible();
  });


  test('10.6 admin can submit extended Add user flow from bottom CRUD CTA', async ({ page }) => {
    let createPayload: any = null;

    await mockApiRoutes(page, 'ADMIN', undefined, undefined, (payload) => {
      createPayload = payload;
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@cambios.com', process.env.E2E_ADMIN_PASSWORD || 'admin1234');

    await page.getByRole('tab', { name: 'Usuarios' }).click();
    await page.getByTestId('admin-add-user-bottom-cta').getByText('Add user').click();

    await page.getByTestId('add-user-name-input').fill('Usuario Extendido');
    await page.getByTestId('add-user-email-input').fill('extendido@cambios.com');
    await page.getByTestId('add-user-last-name-input').fill('Operativo');
    await page.getByTestId('add-user-phone-input').fill('+53 555 12 34');
    await page.getByTestId('add-user-locale-input').fill('es-CU');
    await page.getByTestId('add-user-timezone-input').fill('America/Havana');
    await page.getByTestId('add-user-license-plan-id-input').fill('2');

    await page.getByTestId('add-user-submit-button').click();

    await expect.poll(() => createPayload).not.toBeNull();
    expect(createPayload).toMatchObject({
      name: 'Usuario Extendido',
      email: 'extendido@cambios.com',
      profile: { lastName: 'Operativo' },
      contact: { phone: '+53 555 12 34' },
      preferences: { locale: 'es-CU', timezone: 'America/Havana' },
      licenseSetup: { planId: 2 },
    });
  });

  test('5.10 USER cannot access admin flow', async ({ page }) => {
    await mockApiRoutes(page, 'USER');

    await page.goto('/');
    await login(page, process.env.E2E_USER_EMAIL || 'user@cambios.com', process.env.E2E_USER_PASSWORD || 'user1234');

    await expect(page.getByText('Inicio')).toBeVisible();
    await expect(page.getByText('Transacciones')).toBeVisible();
    await expect(page.getByText('Servicios')).toHaveCount(0);

    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Servicios')).toHaveCount(0);
  });
});

async function login(page: Page, email: string, password: string): Promise<void> {
  const emailInput = page.getByPlaceholder('admin@cambios.com');
  if ((await emailInput.count()) > 0) {
    await emailInput.fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByText('Iniciar Sesión').click();
    return;
  }

  await Promise.race([
    page.getByText('Inicio').waitFor({ timeout: 10_000 }),
    page.getByText('Inicio Admin').waitFor({ timeout: 10_000 }),
  ]);
}

async function mockApiRoutes(
  page: Page,
  role: 'ADMIN' | 'USER',
  onUserControlAction?: (payload: unknown) => void,
  options?: { failAuditLogsOnSecondCall?: boolean },
  onCreateUser?: (payload: unknown) => void,
): Promise<void> {
  let auditLogsCalls = 0;

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

    if (url.includes('/auth/login') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'e2e-token',
          user: {
            id: role === 'ADMIN' ? 1 : 2,
            email: role === 'ADMIN' ? 'admin@cambios.com' : 'user@cambios.com',
            name: role === 'ADMIN' ? 'Admin E2E' : 'User E2E',
            role,
          },
        }),
      });
      return;
    }

    if (url.includes('/admin/users/2/actions') && method === 'POST') {
      const payload = route.request().postDataJSON();
      onUserControlAction?.(payload);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          actionType: payload.actionType,
        }),
      });
      return;
    }

    if (url.endsWith('/admin/users') && method === 'POST') {
      const payload = route.request().postDataJSON();
      onCreateUser?.(payload);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 3,
          email: payload.email,
          name: payload.name,
          role: payload.role ?? 'USER',
          isActive: true,
          isBanned: false,
          blockedUntil: null,
          failedLoginAttempts: 0,
        }),
      });
      return;
    }

    if (url.includes('/admin/users/2') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 2,
          email: 'user@cambios.com',
          name: 'User E2E',
          role: 'USER',
          isActive: true,
          isBanned: false,
          blockedUntil: null,
          failedLoginAttempts: 0,
          license: {
            id: 1,
            state: 'ACTIVE',
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            planId: 1,
          },
          recentActions: [],
        }),
      });
      return;
    }

    if (url.includes('/admin/audit-logs')) {
      auditLogsCalls += 1;
      if (options?.failAuditLogsOnSecondCall && auditLogsCalls >= 2) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Simulated partial failure' }),
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      return;
    }

    if (
      url.includes('/bank-accounts') ||
      url.includes('/admin/users') ||
      url.includes('/admin/users/blocked') ||
      url.includes('/admin/licenses/expiring') ||
      url.includes('/subscriptions/licenses')
    ) {
      const usersPayload = [
        {
          id: 1,
          email: 'admin@cambios.com',
          name: 'Admin E2E',
          role: 'ADMIN',
          isActive: true,
          isBanned: false,
          blockedUntil: null,
          failedLoginAttempts: 0,
        },
        {
          id: 2,
          email: 'user@cambios.com',
          name: 'User E2E',
          role: 'USER',
          isActive: true,
          isBanned: false,
          blockedUntil: null,
          failedLoginAttempts: 0,
        },
      ];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(url.includes('/admin/users') ? usersPayload : []),
      });
      return;
    }

    if (url.includes('/admin/kpis')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 2,
          activeUsers30d: 2,
          newUsersPeriod: 1,
          suspendedUsers: 0,
          usersByRole: { ADMIN: 1, USER: 1 },
          usersByPlan: { STANDARD: 2 },
          licensesByState: { ACTIVE: 2 },
          expiringIn7d: 0,
          expiringIn30d: 0,
          churnPeriod: 0,
          reactivatedPeriod: 0,
          trialToPaidConversionPct: 0,
          renewalRatePct: 0,
          cancellationRatePct: 0,
          mrrEstimateCup: 0,
          arpuEstimateCup: 0,
          revenueAtRiskCup: 0,
        }),
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });
}
