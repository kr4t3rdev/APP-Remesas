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

    await expect(page.getByRole('menuitem', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Servicios' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Usuarios' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Reportes' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Perfil' })).toBeVisible();

    await page.getByRole('menuitem', { name: 'Usuarios' }).click();
    await page.getByTestId('admin-user-row-2').click();
    await expect(page.getByText('User E2E').filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });

    // Change Role opens a role-selection modal (no free-text reason input in the redesigned UI)
    await page.getByText('Change Role').filter({ visible: true }).first().click();
    await expect(page.getByText('SELECT NEW ROLE')).toBeVisible();
    await page.getByText('Admin', { exact: true }).filter({ visible: true }).first().click();
    await page.getByText('Update Role').click();

    await expect.poll(() => actionPayload).not.toBeNull();
    expect(actionPayload).toMatchObject({
      actionType: 'CHANGE_ROLE',
      payload: { newRole: 'ADMIN' },
    });
  });

  test('5.9.b admin refresh shows partial warning and keeps home interactive', async ({ page }) => {
    await mockApiRoutes(page, 'ADMIN', undefined, { failAuditLogsOnSecondCall: true });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@cambios.com', process.env.E2E_ADMIN_PASSWORD || 'admin1234');

    await expect(page.getByText('Centro de operaciones').first()).toBeVisible();

    await page.getByTestId('admin-home-refresh-button').click();

    await expect(page.getByText('Datos parciales, intenta actualizar').first()).toBeVisible();
    await expect(page.getByText('Progreso semanal').first()).toBeVisible();
    await expect(page.getByText('Eventos recientes').first()).toBeVisible();
  });

  test('5.9.c admin can navigate to Reportes after a user control action for deep analytics', async ({ page }) => {
    await mockApiRoutes(page, 'ADMIN');

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@cambios.com', process.env.E2E_ADMIN_PASSWORD || 'admin1234');

    await page.getByRole('menuitem', { name: 'Usuarios' }).click();
    await page.getByTestId('admin-user-row-2').click();
    await expect(page.getByText('User E2E').filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });

    // Back to AdminUsers (the detail back button is an icon-only div[tabindex=0] sibling of the "User Profile" header)
    const profileHeader = page.getByText('User Profile').filter({ visible: true }).first();
    await profileHeader.locator('xpath=../..').locator('div[tabindex="0"]').first().click();
    await expect(page.getByTestId('admin-user-row-1')).toBeVisible({ timeout: 15000 });

    await page.getByRole('menuitem', { name: 'Reportes' }).click();
    await expect(page.getByTestId('admin-reports-period-segment')).toBeVisible();
    await expect(page.getByTestId('admin-reports-cashflow-card')).toBeVisible();
    await expect(page.getByTestId('admin-reports-growth-card')).toBeVisible();
  });

  test('10.6 admin can submit extended Add user flow from bottom CRUD CTA', async ({ page }) => {
    let createPayload: any = null;

    await mockApiRoutes(page, 'ADMIN', undefined, undefined, (payload) => {
      createPayload = payload;
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@cambios.com', process.env.E2E_ADMIN_PASSWORD || 'admin1234');

    await page.getByRole('menuitem', { name: 'Usuarios' }).click();
    await page.getByTestId('admin-add-user-bottom-cta').getByText('Add user').click();

    await page.getByTestId('add-user-name-input').fill('Usuario Extendido');
    await page.getByTestId('add-user-email-input').fill('extendido@cambios.com');
    await page.getByTestId('add-user-last-name-input').fill('Operativo');
    await page.getByTestId('add-user-phone-input').fill('+53 555 12 34');

    await page.getByTestId('add-user-submit-button').click();

    await expect.poll(() => createPayload).not.toBeNull();
    expect(createPayload).toMatchObject({
      name: 'Usuario Extendido',
      email: 'extendido@cambios.com',
      profile: { lastName: 'Operativo' },
      contact: { phone: '+53 555 12 34' },
      access: { isActive: true },
    });
  });

  test('5.10 USER cannot access admin flow', async ({ page }) => {
    await mockApiRoutes(page, 'USER');

    await page.goto('/');
    await login(page, process.env.E2E_USER_EMAIL || 'user@cambios.com', process.env.E2E_USER_PASSWORD || 'user1234');

    await expect(page.getByRole('menuitem', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Transacciones' })).toBeVisible();
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
    await page.getByText('Iniciar Sesión').last().click();
    await expect(page.getByText('Centro de operaciones').first()).toBeVisible({ timeout: 15_000 });
    return;
  }

  const loginCta = page.getByRole('button', { name: 'Iniciar sesión' }).first();
  await loginCta.click();
  await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible({ timeout: 10_000 });
  await page.getByPlaceholder('admin@cambios.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByText('Iniciar Sesión').last().click();

  if (email.startsWith('admin@')) {
    await expect(page.getByText('Centro de operaciones').first()).toBeVisible({ timeout: 15_000 });
  } else {
    await expect(page.getByRole('menuitem', { name: 'Inicio' })).toBeVisible({ timeout: 15_000 });
  }
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

    if (url.includes('/admin/reports/platform-series')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          monthsBack: 6,
          series: [0, 1, 2, 3, 4, 5].map((i) => ({
            year: 2026,
            month: i + 1,
            label: `M${i + 1}`,
            billingCup: 1000 * (i + 1),
            newUsers: i,
            churn: 0,
          })),
          totals: { billingCup: 21000, newUsers: 15, churn: 0 },
        }),
      });
      return;
    }

    if (
      url.includes('/admin/users/blocked') ||
      url.includes('/admin/licenses/expiring') ||
      url.includes('/bank-accounts') ||
      url.includes('/subscriptions/licenses')
    ) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      return;
    }

    if (url.includes('/admin/users') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
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
        ]),
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

    const cup = { id: 2, code: 'CUP', name: 'Peso cubano', symbol: '$', isActive: true };
    const usd = { id: 1, code: 'USD', name: 'Dólar estadounidense', symbol: 'US$', isActive: true };

    if (url.includes('/currencies/with-primary')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ currencies: [usd, cup], primaryCurrencyId: 2 }),
      });
      return;
    }

    if (url.includes('/currencies')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([cup, usd]),
      });
      return;
    }

    if (url.includes('/reports/daily')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          date: '2026-08-13',
          profit: { net: 0 },
          transactions: { total: 0, compras: 0, ventas: 0, totalCompras: 0, totalVentas: 0 },
          expenses: { totalAmount: 0, totalAmountInCup: 0, byCategory: {} },
        }),
      });
      return;
    }

    if (url.includes('/reports/fx-performance')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ positions: [], realizedProfit: 0 }),
      });
      return;
    }

    if (url.includes('/cash/overview')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          asOf: new Date().toISOString(),
          primaryCurrency: cup,
          currencies: [cup, usd],
          balances: [{ id: 21, currencyId: 2, balance: 0, currency: cup }],
          recentMovements: [],
          latestAudits: [],
        }),
      });
      return;
    }

    if (url.includes('/exchange-rates')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ rates: [], currencies: [cup, usd] }),
      });
      return;
    }

    if (
      url.includes('/objectives') ||
      url.includes('/worker-payments') ||
      url.includes('/transactions') ||
      url.includes('/cash-balances')
    ) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      return;
    }

    if (url.includes('/auth/me/primary-currency')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '2' });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });
}
