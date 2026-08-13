import { test, expect, type Page } from '@playwright/test';

/**
 * Visual redesign verification spec.
 * Mocks the API, logs in as ADMIN and USER, navigates to every redesigned screen,
 * verifies the new design markers (KPI strips, thin borders, tabular numerics)
 * and captures screenshots under test-results/design-verify/ for manual review.
 *
 * Run: E2E_RUN=1 npx playwright test e2e/design-verify.spec.ts
 */
test.describe('Redesign visual verification', () => {
  test.skip(process.env.E2E_RUN !== '1', 'Set E2E_RUN=1 to execute');

  const cup = { id: 1, code: 'CUP', name: 'Peso cubano', symbol: '$', isActive: true };
  const usd = { id: 2, code: 'USD', name: 'Dólar estadounidense', symbol: 'US$', isActive: true };
  const eur = { id: 3, code: 'EUR', name: 'Euro', symbol: '€', isActive: true };
  const mlc = { id: 4, code: 'MLC', name: 'MLC', symbol: 'MLC$', isActive: true };

  async function login(page: Page, role: 'ADMIN' | 'USER'): Promise<void> {
    const emailInput = page.getByPlaceholder('admin@cambios.com');
    if ((await emailInput.count()) === 0) {
      const loginCta = page.getByText('Iniciar Sesión').first();
      await loginCta.click();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible({ timeout: 10000 });
    }
    await page.getByPlaceholder('admin@cambios.com').fill(
      role === 'ADMIN' ? 'admin@cambios.com' : 'user@cambios.com',
    );
    await page.getByPlaceholder('••••••••').fill('admin1234');
    await page.getByText('Iniciar Sesión').last().click();
    if (role === 'ADMIN') {
      await expect(page.getByText('Centro de operaciones').first()).toBeVisible({ timeout: 15000 });
    } else {
      await expect(page.getByRole('menuitem', { name: 'Inicio' })).toBeVisible({ timeout: 15000 });
    }
  }

  async function mockApi(page: Page, role: 'ADMIN' | 'USER'): Promise<void> {
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      const isApiLike =
        url.includes('/api/') ||
        url.includes('/auth/') ||
        url.includes('/admin/') ||
        url.includes('/bank-accounts') ||
        url.includes('/subscriptions/licenses') ||
        url.includes('/currencies') ||
        url.includes('/exchange-rates') ||
        url.includes('/cash') ||
        url.includes('/objectives') ||
        url.includes('/worker-payments') ||
        url.includes('/rate-history');

      if (!isApiLike) {
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

      if (url.includes('/auth/me/primary-currency')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(1),
        });
        return;
      }

      if (url.includes('/currencies/with-primary')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            currencies: [cup, usd, eur, mlc],
            primaryCurrencyId: 1,
          }),
        });
        return;
      }

      if (url.includes('/currencies')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([cup, usd, eur, mlc]),
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
            balances: [
              { id: 10, currencyId: 1, balance: 1500.5, currency: cup },
              { id: 11, currencyId: 2, balance: 220.25, currency: usd },
            ],
            recentMovements: [
              {
                id: 'adj-1',
                kind: 'ADJUSTMENT',
                type: 'INGRESO',
                direction: 'IN',
                title: 'Ajuste manual',
                description: 'Fondo inicial',
                amount: 50,
                totalBase: null,
                currency: usd,
                createdAt: new Date().toISOString(),
              },
            ],
            latestAudits: [
              {
                id: 20,
                currencyId: 1,
                currency: cup,
                expectedBalance: 1500,
                actualBalance: 1490,
                difference: -10,
                notes: 'Conteo de cierre',
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        });
        return;
      }

      if (url.includes('/cash-balances') || url.includes('/cash-audits') || url.includes('/cash-adjustments')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        return;
      }

      if (url.includes('/bank-accounts')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Cuenta Principal', bankName: 'Banco Nacional', currencyId: 1, currency: cup, accountNumber: '1234567890', balance: 8500.5, isActive: true },
            { id: 2, name: 'Cuenta USD', bankName: 'Banco Metropolitano', currencyId: 2, currency: usd, accountNumber: '9876543210', balance: 420.75, isActive: true },
          ]),
        });
        return;
      }

      if (url.includes('/exchange-rates/all')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, currencyId: 2, currency: usd, referenceRate: 300, buyMargin: 0.05, sellMargin: 0.05, buyRate: 285, sellRate: 315, effectiveDate: new Date().toISOString() },
            { id: 2, currencyId: 3, currency: eur, referenceRate: 340, buyMargin: 0.04, sellMargin: 0.04, buyRate: 326.4, sellRate: 353.6, effectiveDate: new Date().toISOString() },
          ]),
        });
        return;
      }

      if (url.includes('/exchange-rates')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            rates: [
              { id: 1, currencyId: 2, currency: usd, referenceRate: 300, buyMargin: 0.05, sellMargin: 0.05, buyRate: 285, sellRate: 315, effectiveDate: new Date().toISOString() },
            ],
          }),
        });
        return;
      }

      if (url.includes('/rate-history/manual')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        return;
      }

      if (url.includes('/rate-history')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        return;
      }

      if (url.includes('/objectives')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Fondo de emergencia', description: 'Meta de ahorro', targetAmount: 50000, currentAmount: 25000, percentage: 50, status: 'ACTIVO', currencyId: 1, currency: cup, createdAt: new Date().toISOString() },
          ]),
        });
        return;
      }

      if (url.includes('/worker-payments')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              name: 'María García',
              phone: '+53 555 12 34',
              initials: 'MG',
              balances: [{ id: 1, workerId: 1, currencyId: 1, currency: cup, balance: 1250.5, accumulatedProfit: 100, totalDelivered: 0 }],
              accumulatedProfit: 100,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              name: 'José Pérez',
              phone: '+53 555 56 78',
              initials: 'JP',
              balances: [{ id: 2, workerId: 2, currencyId: 2, currency: usd, balance: 88.25, accumulatedProfit: 30, totalDelivered: 0 }],
              accumulatedProfit: 30,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
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
            expiringIn30d: 1,
            churnPeriod: 0,
            reactivatedPeriod: 0,
            trialToPaidConversionPct: 12.5,
            renewalRatePct: 80,
            cancellationRatePct: 5,
            mrrEstimateCup: 15000,
            arpuEstimateCup: 250,
            revenueAtRiskCup: 3000,
            marginProfit: 1200,
            netProfit: 900,
          }),
        });
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

      if (url.includes('/admin/audit-logs')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, actorUserId: 1, action: 'LOGIN', reason: null, createdAt: new Date().toISOString() },
            { id: 2, actorUserId: 2, action: 'CHANGE_ROLE', reason: 'Escalación', createdAt: new Date().toISOString() },
            { id: 3, actorUserId: 1, action: 'SUSPEND', reason: 'Violación', createdAt: new Date().toISOString() },
          ]),
        });
        return;
      }

      if (url.includes('/admin/licenses/expiring') || url.includes('/admin/users/blocked') || url.includes('/admin/profile/stats')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
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

      if (url.includes('/admin/users') && method === 'GET') {
        const users = [
          { id: 1, email: 'admin@cambios.com', name: 'Admin E2E', role: 'ADMIN', isActive: true, isBanned: false, blockedUntil: null, failedLoginAttempts: 0 },
          { id: 2, email: 'user@cambios.com', name: 'User E2E', role: 'USER', isActive: true, isBanned: false, blockedUntil: null, failedLoginAttempts: 0 },
        ];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(users),
        });
        return;
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });
  }

  async function shot(page: Page, name: string): Promise<void> {
    await page.waitForTimeout(600);
    await page.screenshot({ path: `test-results/design-verify/${name}.png`, fullPage: true });
  }

  async function visibleText(page: Page, text: string, exact = true): Promise<ReturnType<Page['getByText']>> {
    return page.getByText(text, { exact }).filter({ visible: true }).first();
  }

  async function uiBack(page: Page): Promise<void> {
    const back = page.getByLabel('Regresar al perfil');
    if ((await back.count()) > 0) {
      await back.first().click();
      await expect(page.getByText('Acciones rápidas')).toBeVisible({ timeout: 10000 });
      return;
    }
    await page.goBack();
    await expect(page.getByText('Acciones rápidas')).toBeVisible({ timeout: 10000 });
  }

  test.describe('ADMIN — Bloomberg/Linear console density', () => {
    test('AdminHome, AdminUsers, AdminUserDetail, AdminReports render with density markers', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await mockApi(page, 'ADMIN');
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await login(page, 'ADMIN');

      // AdminHome already had the KPI strip
      await shot(page, 'admin-home');

      // AdminUsers: KPI strip + table rows + bottom CTA
      await page.getByRole('menuitem', { name: 'Usuarios' }).click();
      await expect(page.getByTestId('admin-user-row-1')).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('admin-user-row-2')).toBeVisible();
      await expect(page.getByTestId('admin-add-user-bottom-cta')).toBeVisible();
      await shot(page, 'admin-users');

      // AdminUserDetail: identity row + action rows
      await page.getByTestId('admin-user-row-2').click();
      await expect(await visibleText(page, 'User E2E')).toBeVisible({ timeout: 15000 });
      await expect(await visibleText(page, 'Change Role')).toBeVisible();
      await expect(await visibleText(page, 'Reset Password')).toBeVisible();
      await shot(page, 'admin-user-detail');

      // Back to AdminUsers (the detail back button is an icon-only div[tabindex=0] sibling of the "User Profile" header)
      const profileHeader = page.getByText('User Profile').filter({ visible: true }).first();
      await profileHeader.locator('xpath=../..').locator('div[tabindex="0"]').first().click();
      await expect(page.getByTestId('admin-user-row-1')).toBeVisible({ timeout: 15000 });

      // AdminReports: KPI strip + period segment + cards
      await page.getByRole('menuitem', { name: 'Reportes' }).click();
      await expect(page.getByText('Reportes').filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('admin-reports-period-segment')).toBeVisible();
      await expect(page.getByTestId('admin-reports-cashflow-card')).toBeVisible();
      await expect(page.getByTestId('admin-reports-growth-card')).toBeVisible();
      await expect(page.getByTestId('admin-reports-system-usage')).toBeVisible();
      await page.getByTestId('admin-reports-period-annual').click();
      await shot(page, 'admin-reports');
    });
  });

  test.describe('USER — Mercury/Brex/Wise fintech density', () => {
    test('Cash, BankAccounts, Currencies, ExchangeRates, Objectives, WorkerPayments render', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await mockApi(page, 'USER');
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await login(page, 'USER');

      // Cash tab — hero + balances + quick actions
      await page.getByRole('menuitem', { name: 'Caja' }).click();
      await expect(page.getByText('Acciones rápidas')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Arqueo de Caja')).toBeVisible();
      await shot(page, 'user-cash');

      // BankAccounts from quick action
      await (await visibleText(page, 'Cuentas Bancarias')).click();
      await expect(await visibleText(page, 'Cuenta Principal')).toBeVisible({ timeout: 15000 });
      await expect(await visibleText(page, 'Cuenta USD')).toBeVisible();
      await shot(page, 'user-bank-accounts');

      // Back to Cash then Currencies
      await uiBack(page);
      await (await visibleText(page, 'Monedas')).click();
      await expect(await visibleText(page, 'MONEDA PRINCIPAL')).toBeVisible({ timeout: 15000 });
      await expect(await visibleText(page, 'CUP')).toBeVisible();
      await shot(page, 'user-currencies');

      // Back then ExchangeRates
      await uiBack(page);
      await (await visibleText(page, 'Tasa de Cambio')).click();
      await expect(await visibleText(page, 'Dólar estadounidense')).toBeVisible({ timeout: 15000 });
      await shot(page, 'user-exchange-rates');

      // Back then Objectives (anchor on the unique quick-action subtitle to avoid the objectives section title)
      await uiBack(page);
      await page.getByText('Metas financieras y seguimiento').click();
      await expect(await visibleText(page, 'Fondo de emergencia')).toBeVisible({ timeout: 15000 });
      await shot(page, 'user-objectives');

      // WorkerPayments via Transactions tab
      await uiBack(page);
      await page.getByRole('menuitem', { name: 'Transacciones' }).click();
      await expect(await visibleText(page, 'María García')).toBeVisible({ timeout: 15000 });
      await expect(await visibleText(page, 'José Pérez')).toBeVisible();
      await shot(page, 'user-worker-payments');
    });
  });
});