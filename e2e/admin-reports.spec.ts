import { expect, test, type Page } from '@playwright/test';

test.describe('Admin reports dashboard', () => {
  test.skip(process.env.E2E_RUN !== '1', 'Set E2E_RUN=1 to execute E2E flows');

  test('renders redesigned admin reports dashboard without crash', async ({ page }) => {
    await mockAdminReportsApi(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@cambios.com', process.env.E2E_ADMIN_PASSWORD || 'admin1234');

    await page.getByRole('tab', { name: 'Reportes' }).click();

    await expect(page.getByTestId('admin-reports-title')).toBeVisible();
    await expect(page.getByTestId('admin-reports-period-segment')).toBeVisible();
    await expect(page.getByTestId('admin-reports-cashflow-card')).toBeVisible();
    await expect(page.getByTestId('admin-reports-growth-card')).toBeVisible();
    await expect(page.getByTestId('admin-reports-system-usage')).toBeVisible();
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

async function mockAdminReportsApi(page: Page): Promise<void> {
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    const isApiLikeRequest =
      url.includes('/api/') ||
      url.includes('/auth/') ||
      url.includes('/admin/') ||
      url.includes('/reports/') ||
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
            id: 1,
            email: 'admin@cambios.com',
            name: 'Admin E2E',
            role: 'ADMIN',
          },
        }),
      });
      return;
    }

    if (url.includes('/admin/kpis')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 1240,
          activeUsers30d: 1100,
          newUsersPeriod: 58,
          suspendedUsers: 19,
          usersByRole: { ADMIN: 4, USER: 1236 },
          usersByPlan: {},
          licensesByState: { ACTIVE: 1001, EXPIRED: 239 },
          expiringIn7d: 10,
          expiringIn30d: 32,
          churnPeriod: 1.4,
          reactivatedPeriod: 10,
          trialToPaidConversionPct: 8.4,
          renewalRatePct: 12.5,
          cancellationRatePct: 2.1,
          mrrEstimateCup: 45230,
          arpuEstimateCup: 0,
          revenueAtRiskCup: 0,
        }),
      });
      return;
    }

    if (url.includes('/reports/period')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          period: {
            startDate: '2026-01-01',
            endDate: '2026-01-31',
          },
          summary: {
            totalTransactions: 192000,
            totalExpenses: 63600,
            totalProfit: 128400,
          },
          dailyBreakdown: [
            { date: '2026-01-03', transactions: 34000, expenses: 12000 },
            { date: '2026-01-08', transactions: 24000, expenses: 11000 },
            { date: '2026-01-13', transactions: 42000, expenses: 14000 },
            { date: '2026-01-17', transactions: 30000, expenses: 12000 },
            { date: '2026-01-22', transactions: 28000, expenses: 13000 },
            { date: '2026-01-27', transactions: 34000, expenses: 16000 },
          ],
          transactionsByCurrency: {},
          expensesByCategory: {},
        }),
      });
      return;
    }

    if (url.includes('/admin/audit-logs')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, actorUserId: 1, action: 'LOGIN', createdAt: '2026-01-10T12:00:00.000Z' },
          { id: 2, actorUserId: 1, action: 'USER_CREATED', createdAt: '2026-02-03T12:00:00.000Z' },
          { id: 3, actorUserId: 1, action: 'LICENSE_EXTENDED', createdAt: '2026-03-05T12:00:00.000Z' },
        ]),
      });
      return;
    }

    if (url.includes('/admin/users/blocked') || url.includes('/admin/licenses/expiring')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      return;
    }

    if (url.includes('/admin/users')) {
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
        ]),
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
}
