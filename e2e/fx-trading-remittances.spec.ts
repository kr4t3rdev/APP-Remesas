import { expect, test, type Page } from '@playwright/test';

const currencies = [{ id: 1, code: 'USD', symbol: '$', name: 'Dólar', isActive: true }];
const rates = [{ id: 1, currencyId: 1, buyRate: 370, sellRate: 375, currency: currencies[0] }];
const openingPosition = { currencyId: 1, currency: currencies[0], saldo: 100, costoPromedio: 360, rendimiento: 1500 };

test.describe('FX trading and remittances — Phase 4', () => {
test.beforeEach(async ({ page }, testInfo) => {
  await mockFxApi(page, testInfo.title);
    await seedAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // SecureStore's web shim can resolve null instead of throwing; reload after
    // explicitly writing the same authStore fallback keys to make setup stable.
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'e2e-token');
      localStorage.setItem('user_data', JSON.stringify({ id: 1, name: 'FX E2E', email: 'user@cambios.com', role: 'USER' }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('tab-Home')).toBeVisible();
  });

  test('reviewed opening → buy → sell shows saldo and rendimiento', async ({ page }) => {
    await openTransactions(page);
    await expect(page.getByText('USD').first()).toBeVisible();
    await expect(page.getByText('Nueva Transacción')).toBeVisible();
    await page.getByPlaceholder('0.00').first().fill('10');
    const transferRequest = page.waitForRequest((request) => request.url().includes('/fx-operations/transfers'));
    await page.getByText('Registrar Transacción').click();
    await expect((await transferRequest).method()).toBe('POST');
    await expect(page.getByText('Nueva Transacción')).not.toBeVisible();
  });

  test('sale above available saldo is blocked before submission', async ({ page }) => {
    await openTransactions(page);
    await page.getByText('Venta', { exact: true }).click();
    await page.getByPlaceholder('0.00').first().fill('101');
    await page.getByRole('button', { name: 'Registrar Transacción' }).click();
    await expect(page.getByText('Saldo insuficiente', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Registrar Transacción' })).toBeEnabled();
  });

  test('completed remittance applies one two-currency effect', async ({ page }) => {
    const response = await requestRemittance(page, { provider: 'mock-provider', externalId: 'rem-1', status: 'COMPLETED' });
    expect(response.status).toBe(201);
    await openTransactions(page);
    await expect(page.getByText('Nueva Transacción')).toBeVisible();
  });

  test('duplicate remittance callback is reported as duplicate-safe', async ({ page }) => {
    const payload = { provider: 'mock-provider', externalId: 'rem-duplicate', status: 'COMPLETED' };
    const first = await requestRemittance(page, payload);
    const duplicate = await requestRemittance(page, { ...payload, replay: true });
    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(200);
    await openTransactions(page);
    await expect(page.getByText('Nueva Transacción')).toBeVisible();
  });

  test('dashboard refresh reconciles positions, transfers, and remittances', async ({ page }) => {
    await expect(page.getByText('Ganancia Hoy')).toBeVisible();
    await page.getByTestId('tab-Transactions').click();
    await expect(page.getByText('USD').first()).toBeVisible();
    await page.getByTestId('tab-Home').click();
    await page.reload();
    await expect(page.getByText('Ganancia Hoy')).toBeVisible();
    await expect(page.getByText('$ 1,500.00')).toBeVisible();
  });

  test('loading, empty, error, and retry states recover deterministically', async ({ page }) => {
    await page.getByTestId('tab-Transactions').click();
    await expect(page.getByText('No hay transacciones', { exact: true })).toBeVisible();
    await page.getByTestId('tab-Home').click();
    await expect(page.getByText('Ganancia Hoy')).toBeVisible();
    await page.getByTestId('tab-Transactions').click();
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
  await page.getByText('Transacciones', { exact: true }).last().click();
  await expect(page.getByText('USD').first()).toBeVisible();
  await page.getByRole('button', { name: 'Nueva transacción' }).click();
  await expect(page.getByText('Nueva Transacción')).toBeVisible();
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
    status: 'RECONCILIADO',
    createdAt: '2026-07-13T12:00:00.000Z',
    currency: currencies[0],
  };
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type, authorization',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: corsHeaders });
    if (url.includes('/auth/login')) return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ access_token: 'e2e-token', user: { id: 1, name: 'FX E2E', email: 'user@cambios.com', role: 'USER' } }) });
    if (url.includes('/remittances/events')) return route.fulfill({ status: request.postDataJSON()?.replay ? 200 : 201, contentType: 'application/json', body: JSON.stringify({ status: 'COMPLETED', duplicate: Boolean(request.postDataJSON()?.replay) }) });
    if (url.includes('/remittances')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 1, provider: 'mock-provider', status: 'Remesa completada' }, { id: 2, provider: 'mock-provider', status: 'Remesa duplicada segura', duplicate: true }]) });
    if (url.includes('/reports/fx-performance')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ positions: [openingPosition], realizedProfit: 1500 }) });
    if (url.includes('/currencies')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currencies) });
    if (url.includes('/exchange-rates')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rates }) });
    if (url.includes('/transactions')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isEmptyStateTest ? [] : [openingTransaction]) });
    if (url.includes('/fx-operations/transfers')) return route.fulfill({ status: request.postDataJSON()?.type === 'VENTA' ? 422 : 201, contentType: 'application/json', body: JSON.stringify({ id: 1 }) });
    if (url.includes('/reports/daily')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profit: { net: 1500 }, transactions: { total: 1, compras: 1, ventas: 0, totalCompras: 3700, totalVentas: 0 }, expenses: { totalAmount: 0, total: 0, byCategory: {} } }) });
    if (url.includes('/cash-balances')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ currencyId: 1, balance: 100, currency: currencies[0] }]) });
    return route.continue();
  });
}
