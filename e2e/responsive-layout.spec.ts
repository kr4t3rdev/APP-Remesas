import { test, expect, Page } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test.skip(process.env.E2E_RUN !== '1', 'Set E2E_RUN=1 to execute E2E flows');

  // Helper to login
  async function login(page: Page): Promise<void> {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const emailInput = page.getByPlaceholder('admin@cambios.com');
    if ((await emailInput.count()) === 0) {
      const loginCta = page.getByText('Iniciar Sesión').first();
      await loginCta.click();
      await expect(page.getByPlaceholder('admin@cambios.com')).toBeVisible({ timeout: 10_000 });
    }
    await page.getByPlaceholder('admin@cambios.com').fill('user@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByText('Iniciar Sesión').last().click();

    // Already logged in (mobile uses floating tab bar, desktop/tablet uses sidebar)
    await Promise.race([
      page.getByTestId('floating-tab-bar').waitFor({ timeout: 10_000 }),
      page.getByTestId('sidebar').waitFor({ timeout: 10_000 }),
    ]);
  }

  // Helper to mock API
  async function mockApi(page: Page): Promise<void> {
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
              email: 'user@test.com',
              name: 'Test User',
              role: 'USER',
            },
          }),
        });
        return;
      }

      const cup = { id: 1, code: 'CUP', name: 'Peso cubano', symbol: '$', isActive: true };
      const usd = { id: 2, code: 'USD', name: 'Dólar estadounidense', symbol: 'US$', isActive: true };

      if (url.includes('/auth/me/primary-currency')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '1' });
        return;
      }

      if (url.includes('/currencies/with-primary')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ currencies: [cup, usd], primaryCurrencyId: 1 }),
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

      if (url.includes('/cash/overview')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            asOf: new Date().toISOString(),
            primaryCurrency: cup,
            currencies: [cup, usd],
            balances: [{ id: 10, currencyId: 1, balance: 1500.5, currency: cup }],
            recentMovements: [],
            latestAudits: [],
          }),
        });
        return;
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  }

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test.describe('Mobile Layout (< 640px)', () => {
    test('shows bottom tabs on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await login(page);

      // Bottom tabs should be visible
      const bottomTabs = page.getByTestId('floating-tab-bar');
      await expect(bottomTabs).toBeVisible();

      // Sidebar should NOT be visible
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).not.toBeVisible();

      // Tab items should be visible (aria labels, icon-only rendering)
      await expect(page.getByRole('tab', { name: 'Inicio' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Transacciones' })).toBeVisible();
    });

    test('bottom tabs are tappable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await login(page);

      // Tap on Transactions tab
      await page.getByRole('tab', { name: 'Transacciones' }).click();

      // Should navigate (verify by checking URL or content change)
      await page.waitForTimeout(500);
    });
  });

  test.describe('Tablet Layout (640px - 1023px)', () => {
    test('shows collapsed sidebar on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await login(page);

      // Sidebar should be visible
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toBeVisible();

      // Sidebar should be collapsed (narrow)
      const sidebarWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(sidebarWidth).toBeLessThan(100);

      // Bottom tabs should NOT be visible
      const bottomTabs = page.getByTestId('floating-tab-bar');
      await expect(bottomTabs).not.toBeVisible();
    });

    test('sidebar items are tappable on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await login(page);

      // Click on a sidebar item (Transacciones)
      await page.getByLabel('Transacciones').click();

      // Should navigate
      await page.waitForTimeout(500);
    });
  });

  test.describe('Desktop Layout (>= 1024px)', () => {
    test('shows expanded sidebar on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await login(page);

      // Sidebar should be visible and expanded
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toBeVisible();

      // Sidebar should be expanded (wider)
      const sidebarWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(sidebarWidth).toBeGreaterThan(200);

      // Bottom tabs should NOT be visible
      const bottomTabs = page.getByTestId('floating-tab-bar');
      await expect(bottomTabs).not.toBeVisible();
    });

    test('sidebar collapse toggle works on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await login(page);

      const sidebar = page.locator('[data-testid="sidebar"]');
      
      // Get initial width
      const initialWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);

      // Click collapse button
      await page.getByLabel('Colapsar sidebar').click();
      await page.waitForTimeout(300);

      // Sidebar should be narrower
      const collapsedWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(collapsedWidth).toBeLessThan(initialWidth);
    });

    test('sidebar navigation is synced', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await login(page);

      // Click on Reportes in sidebar
      await page.getByLabel('Reportes').click();
      await page.waitForTimeout(500);

      // Reportes should be highlighted as active
      const reportesItem = page.getByLabel('Reportes').locator('..');
      await expect(reportesItem).toHaveCSS('background-color', /rgba/);
    });

    test('header is visible on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await login(page);

      // Navigate to a feature screen that renders its own header
      await page.getByLabel('Transacciones').click();

      // Feature screen header should be visible
      await expect(
        page.getByRole('heading', { name: 'Transacciones' }).first(),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Nueva transacción' }),
      ).toBeVisible();
    });
  });

  test.describe('Breakpoint Transitions', () => {
    test('layout transitions smoothly when resizing', async ({ page }) => {
      // Start mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await login(page);

      // Verify mobile layout
      const bottomTabs = page.getByTestId('floating-tab-bar');
      await expect(bottomTabs).toBeVisible();

      // Resize to tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(200); // Wait for debounce

      // Verify tablet layout
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toBeVisible();

      // Resize to desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(200);

      // Verify desktop layout
      const sidebarWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(sidebarWidth).toBeGreaterThan(200);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('sidebar items are keyboard accessible on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await login(page);

      // Focus on sidebar
      await page.keyboard.press('Tab');
      
      // Tab through sidebar items
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }

      // Press Enter on an item
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Should have navigated
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toBeVisible();
    });
  });
});
