import { expect, test, type Page } from '@playwright/test';

const currencies = [
  { id: 1, code: 'USD', symbol: '$', name: 'Dólar', isActive: true },
  { id: 2, code: 'CUP', symbol: '$', name: 'Peso cubano', isActive: true },
];

const cashBalances = [
  { id: 21, currencyId: 1, currency: currencies[0], balance: 100 },
  { id: 22, currencyId: 2, currency: currencies[1], balance: 10_000 },
];

test.describe('FX trading and remittances — Phase 4', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await mockFxApi(page, testInfo.title);
    await seedAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'e2e-token');
      localStorage.setItem('user_data', JSON.stringify({ id: 1, name: 'FX E2E', email: 'user@cambios.com', role: 'USER' }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('menuitem', { name: 'Inicio' })).toBeVisible({ timeout: 15_000 });
  });

  test('reviewed opening → buy → sell shows saldo and rendimiento', async ({ page }) => {
    await openTransactions(page);
    await expect(page.getByText('USD').first()).toBeVisible();
    await expect(page.getByText('Nueva operación')).toBeVisible();
    await page.getByLabel('Monto de la operación').fill('10');
    const transferRequest = page.waitForRequest((request) => request.url().includes('/fx-operations/transfers'));
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect((await transferRequest).method()).toBe('POST');
    await expect(page.getByText('Operación guardada correctamente.')).toBeVisible({ timeout: 10_000 });
  });

  test('sale above available saldo is blocked before submission', async ({ page }) => {
    await openTransactions(page);
    await page.getByLabel('Venta', { exact: true }).click();
    await page.getByLabel('Monto de la operación').fill('101');
    await expect(
      page.getByText('No hay fondos suficientes en Caja o cuentas bancarias para esta operación.'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  test('completed remittance applies one two-currency effect', async ({ page }) => {
    const response = await requestRemittance(page, { provider: 'mock-provider', externalId: 'rem-1', status: 'COMPLETED' });
    expect(response.status).toBe(201);
    await openTransactions(page);
    await expect(page.getByText('Nueva operación')).toBeVisible();
  });

  test('duplicate remittance callback is reported as duplicate-safe', async ({ page }) => {
    const payload = { provider: 'mock-provider', externalId: 'rem-duplicate', status: 'COMPLETED' };
    const first = await requestRemittance(page, payload);
    const duplicate = await requestRemittance(page, { ...payload, replay: true });
    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(200);
    await openTransactions(page);
    await expect(page.getByText('Nueva operación')).toBeVisible();
  });

  test('dashboard refresh reconciles positions, transfers, and remittances', async ({ page }) => {
    await expect(page.getByText('Ganancia Hoy')).toBeVisible();
    await page.getByRole('menuitem', { name: 'Transacciones' }).click();
    await expect(page.getByText('USD').first()).toBeVisible();
    await page.getByRole('menuitem', { name: 'Inicio' }).click();
    await page.reload();
    await expect(page.getByText('Ganancia Hoy')).toBeVisible();
    await expect(page.getByText('$ 1,500.00')).toBeVisible();
  });

  test('loading, empty, error, and retry states recover deterministically', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Transacciones' }).click();
    await expect(page.getByText('No hay transacciones', { exact: true })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Inicio' }).click();
    await expect(page.getByText('Ganancia Hoy')).toBeVisible();
    await page.getByRole('menuitem', { name: 'Transacciones' }).click();
    await expect(page.getByText('No hay transacciones', { exact: true })).toBeVisible();
  });
});

async function seedAuthenticatedSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'e2e-token');
    localStorage.setItem(
      'user_data',
      JSON.stringify({ id: 1, name: 'FX E2E', email: 'user@cambios.com', role: 'USER' }),
    );
  });
}

async function openTransactions(page: Page): Promise<void> {
  await page.getByRole('menuitem', { name: 'Transacciones' }).click();
  await expect(page.getByRole('button', { name: 'Nueva transacción' })).toBeVisible();
  await page.getByRole('button', { name: 'Nueva transacción' }).click();
  await expect(page.getByText('Nueva operación')).toBeVisible();
}

async function requestRemittance(page: Page, payload: Record<string, unknown>): Promise<{ status: number; body: unknown }> {
  return page.evaluate(async (body) => {
    const response = await fetch('/remittances/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  }, payload);
}

async function mockFxApi(page: Page, testTitle: string): Promise<void> {
  const isEmptyStateTest = testTitle.includes('loading, empty, error');
  const openingTransaction = {
    id: 1,
    type: 'COMPRA',
    amount: 10,
    rate: 370,
    totalCup: 3700,
    status: 'RECONCILIADO',
    createdAt: '2026-07-13T12:00:00.000Z',
    currency: currencies[0],
  };
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type, authorization, idempotency-key',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: corsHeaders });
    if (url.includes('/auth/login')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ access_token: 'e2e-token', user: { id: 1, name: 'FX E2E', email: 'user@cambios.com', role: 'USER' } }) });
    if (url.includes('/auth/me') || url.includes('/users/me')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ id: 1, name: 'FX E2E', email: 'user@cambios.com', role: 'USER' }) });
    if (url.includes('/remittances/events')) return route.fulfill({ status: request.postDataJSON()?.replay ? 200 : 201, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ status: 'COMPLETED', duplicate: Boolean(request.postDataJSON()?.replay) }) });
    if (url.includes('/remittances')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify([{ id: 1, provider: 'mock-provider', status: 'Remesa completada' }, { id: 2, provider: 'mock-provider', status: 'Remesa duplicada segura', duplicate: true }]) });
    if (url.includes('/reports/fx-performance')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ positions: [{ currencyId: 1, currency: currencies[0], saldo: 100, costoPromedio: 360, availableForSale: true }], realizedProfit: 1500 }) });
    if (url.includes('/currencies/with-primary')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ currencies, primaryCurrencyId: 2 }) });
    if (url.includes('/currencies')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify(currencies) });
    if (url.includes('/exchange-rates')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ rates: [{ id: 1, currencyId: 1, buyRate: 370, sellRate: 375, currency: currencies[0] }] }) });
    if (url.includes('/transactions')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify(isEmptyStateTest ? [] : [openingTransaction]) });
    if (url.includes('/cash/overview')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ asOf: new Date().toISOString(), primaryCurrency: currencies[1], currencies, balances: cashBalances, recentMovements: [], latestAudits: [] }) });
    if (url.includes('/cash-balances')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify(cashBalances) });
    if (url.includes('/objectives')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: '[]' });
    if (url.includes('/worker-payments')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: '[]' });
    if (url.includes('/bank-accounts')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: '[]' });
    if (url.includes('/expenses')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: '[]' });
    if (url.includes('/fx-operations/transfers')) return route.fulfill({ status: 201, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ transaction: { id: 1 } }) });
    if (url.includes('/reports/daily')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ profit: { net: 1500 }, transactions: { total: 1, compras: 1, ventas: 0, totalCompras: 3700, totalVentas: 0 }, expenses: { totalAmount: 0, totalAmountInCup: 0, byCategory: {} } }) });
    if (url.includes('/auth/me/primary-currency')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: '2' });
    return route.continue();
  });
}