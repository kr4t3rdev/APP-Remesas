import { expect, test, type Page } from '@playwright/test';

type Route = 'CASH_TO_CASH' | 'CASH_TO_BANK' | 'BANK_TO_CASH' | 'BANK_TO_BANK';

const currencies = [
  { id: 1, code: 'USD', symbol: '$', name: 'Dólar', isActive: true },
  { id: 2, code: 'CUP', symbol: '$', name: 'Peso cubano', isActive: true },
];

const bankAccounts = [
  { id: 11, name: 'Cuenta USD', bankName: 'Banco Uno', currencyId: 1, currency: currencies[0], accountNumber: '0011', balance: 200, isActive: true },
  { id: 12, name: 'Cuenta CUP', bankName: 'Banco Uno', currencyId: 2, currency: currencies[1], accountNumber: '0012', balance: 20_000, isActive: true },
];

const cashBalances = [
  { id: 21, currencyId: 1, currency: currencies[0], balance: 100 },
  { id: 22, currencyId: 2, currency: currencies[1], balance: 10_000 },
];

test.describe('FX transfer account routes', () => {
  for (const route of ['CASH_TO_CASH', 'CASH_TO_BANK', 'BANK_TO_CASH', 'BANK_TO_BANK'] as Route[]) {
    test(`${route} records origin, destination, balances and history`, async ({ page }) => {
      const state = await mockTransferApi(page);
      await seedAuthenticatedSession(page);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        localStorage.setItem('auth_token', 'e2e-token');
        localStorage.setItem('user_data', JSON.stringify({ id: 1, name: 'Transfer E2E', email: 'user@cambios.com', role: 'USER' }));
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.getByTestId('tab-Home')).toBeVisible();
      await openTransactions(page);

      await page.getByRole('button', { name: 'Nueva operación' }).click();
      await expect(page.getByText('Nueva operación')).toBeVisible();
      await page.getByLabel('Monto de la operación').fill('10');

      const sourceType = route.startsWith('CASH') ? 'CASH' : 'BANK_ACCOUNT';
      const destinationType = route.endsWith('CASH') ? 'CASH' : 'BANK_ACCOUNT';
      const sourceLabel = sourceType === 'CASH' ? 'Caja · CUP' : 'Banco Uno · Cuenta CUP';
      const destinationLabel = destinationType === 'CASH' ? 'Caja · USD' : 'Banco Uno · Cuenta USD';
      await page.getByLabel(sourceLabel, { exact: true }).click();
      await page.getByLabel(destinationLabel, { exact: true }).click();

      const transferRequest = page.waitForRequest((request) => request.url().includes('/fx-operations/transfers'));
      await page.getByRole('button', { name: 'Guardar' }).click();
      const request = await transferRequest;
      const payload = request.postDataJSON();
      expect(payload).toMatchObject({
        type: 'COMPRA',
        amount: 10,
        rate: 370,
        sourceType,
        destinationType,
      });
      expect(request.headers()['idempotency-key']).toBeTruthy();
      await expect(page.getByText('Operación guardada correctamente.')).toBeVisible();

      const snapshot = await page.evaluate(async () => {
        const [cash, banks, transactions] = await Promise.all([
          fetch('/cash-balances').then((response) => response.json()),
          fetch('/bank-accounts').then((response) => response.json()),
          fetch('/transactions').then((response) => response.json()),
        ]);
        return { cash, banks, transactions };
      });
      expect(snapshot.transactions).toHaveLength(1);
      expect(state.history).toHaveLength(1);
      expect(snapshot.cash.find((item: { currencyId: number }) => item.currencyId === 2).balance).toBe(sourceType === 'CASH' ? 6_300 : 10_000);
      expect(snapshot.banks.find((item: { id: number }) => item.id === 12).balance).toBe(destinationType === 'BANK_ACCOUNT' ? 20_000 + 10 : 20_000);
    });
  }

  test('VENTA routes the foreign currency out and CUP into the selected destination', async ({ page }) => {
    const state = await mockTransferApi(page);
    await seedAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'e2e-token');
      localStorage.setItem('user_data', JSON.stringify({ id: 1, name: 'Transfer E2E', email: 'user@cambios.com', role: 'USER' }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('tab-Home')).toBeVisible();
    await openTransactions(page);
    await page.getByRole('button', { name: 'Nueva operación' }).click();
    await page.getByLabel('Venta', { exact: true }).click();
    await page.getByLabel('Monto de la operación').fill('10');
    await page.getByLabel('Banco Uno · Cuenta USD', { exact: true }).click();
    await page.getByLabel('Banco Uno · Cuenta CUP', { exact: true }).click();
    const transferRequest = page.waitForRequest((request) => request.url().includes('/fx-operations/transfers'));
    await page.getByRole('button', { name: 'Guardar' }).click();
    const request = await transferRequest;
    expect(request.postDataJSON()).toMatchObject({ type: 'VENTA', amount: 10, rate: 375, sourceType: 'BANK_ACCOUNT', destinationType: 'BANK_ACCOUNT' });
    await expect(page.getByText('Operación guardada correctamente.')).toBeVisible();
    expect(state.history).toHaveLength(1);
    expect(state.banks.find((item) => item.id === 11)?.balance).toBe(190);
    expect(state.banks.find((item) => item.id === 12)?.balance).toBe(23_750);
  });
});

async function openTransactions(page: Page): Promise<void> {
  await page.getByText('Transacciones', { exact: true }).last().click();
  await expect(page.getByText('USD').first()).toBeVisible();
}

async function seedAuthenticatedSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'e2e-token');
    localStorage.setItem('user_data', JSON.stringify({ id: 1, name: 'Transfer E2E', email: 'user@cambios.com', role: 'USER' }));
  });
}

async function mockTransferApi(page: Page) {
  const state = {
    cash: cashBalances.map((item) => ({ ...item })),
    banks: bankAccounts.map((item) => ({ ...item })),
    history: [] as Array<Record<string, unknown>>,
    transactions: [{ id: 1, type: 'COMPRA', amount: 0, rate: 370, status: 'RECONCILIADO', createdAt: '2026-07-15T12:00:00.000Z', currency: currencies[0], marginProfit: 0 }],
  };
  state.transactions.length = 0;
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization, idempotency-key', 'access-control-allow-methods': 'GET,POST,OPTIONS' } });
    if (url.includes('/currencies')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currencies) });
    if (url.includes('/exchange-rates')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rates: [{ id: 1, currencyId: 1, buyRate: 370, sellRate: 375, currency: currencies[0] }] }) });
    if (url.includes('/reports/fx-performance')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ positions: [{ currencyId: 1, currency: currencies[0], saldo: 100, costoPromedio: 360, availableForSale: true }], realizedProfit: 0 }) });
    if (url.includes('/transactions')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.transactions) });
    if (url.includes('/bank-accounts')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.banks) });
    if (url.includes('/cash-balances')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.cash) });
    if (url.includes('/remittances')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    if (url.includes('/fx-operations/transfers')) {
      const payload = request.postDataJSON();
      const isPurchase = payload.type === 'COMPRA';
      const sourceCurrencyId = isPurchase ? 2 : 1;
      const destinationCurrencyId = isPurchase ? 1 : 2;
      const debit = isPurchase ? payload.amount * payload.rate : payload.amount;
      const credit = isPurchase ? payload.amount : payload.amount * payload.rate;
      const source = payload.sourceType === 'CASH' ? state.cash.find((item) => item.currencyId === sourceCurrencyId)! : state.banks.find((item) => item.id === payload.sourceBankAccountId)!;
      const destination = payload.destinationType === 'CASH' ? state.cash.find((item) => item.currencyId === destinationCurrencyId)! : state.banks.find((item) => item.id === payload.destinationBankAccountId)!;
      source.balance -= debit;
      destination.balance += credit;
      state.history.push({ sourceType: payload.sourceType, destinationType: payload.destinationType, sourceId: source.id, destinationId: destination.id });
      state.transactions.push({ id: 1, type: payload.type, amount: payload.amount, rate: payload.rate, status: 'RECONCILIADO', createdAt: '2026-07-15T12:00:00.000Z', currency: currencies[0], marginProfit: 0 });
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(state.transactions[0]) });
    }
    return route.continue();
  });
  return state;
}
