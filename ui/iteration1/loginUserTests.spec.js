import { test, expect } from 'playwright/test';
import { AdminSteps } from '../../seniorTests/utils/steps/adminSteps.js';

test.describe('AuthService Tests', () => {
  test('user should be able to login after creation', async ({ page }) => {
    const { requestData } = await AdminSteps.createUser();

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('[placeholder="Username"]').fill(requestData.username);
    await page.locator('[placeholder="Password"]').fill(requestData.password);
    await page.getByRole('button', { name: 'Login' }).click();

    const welcome = page.locator('.welcome-text');
    await expect(welcome).toBeVisible();
    await expect(welcome).toHaveText('Welcome, noname!');
  });

  test('admin should be able to login with correct credentials', async ({
    page,
  }) => {
    const admin = { username: 'admin', password: 'admin' };
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('[placeholder="Username"]').fill(admin.username);
    await page.locator('[placeholder="Password"]').fill(admin.password);
    await page.getByRole('button', { name: 'Login' }).click();

    const adminPanel = page.locator('text=Admin Panel');
    await expect(adminPanel).toBeVisible;
  });
});
