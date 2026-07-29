import { expect, test } from 'playwright/test';
import { generateUser } from '../../seniorTests/generators/generateRandomUserData.js';
import { assertThatModels } from '../../seniorTests/models/comparison/modelAssertions.js';
import CreateUserRequest from '../../seniorTests/models/createUserRequest.js';
import ApiConfig from '../../seniorTests/utils/apiConfig.js';
import HttpClient from '../../seniorTests/utils/httpClient.js';

test.describe('Admin Service Tests', () => {
  test('admin should be able to create a new user', async ({ page }) => {
    await page.goto('/');
    await page.locator('[placeholder="Username"]').fill('admin');
    await page.locator('[placeholder="Password"]').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForSelector('text=Admin Panel');

    const newUser = generateUser();

    await page.locator('[placeholder="Username"]').fill(newUser.username);
    await page.locator('[placeholder="Password"]').fill(newUser.password);

    const dialogPromise = page.waitForEvent('dialog');
    await page.click('text=Add User');
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('✅ User created successfully!');
    await dialog.accept();

    const allUserParent = page.locator('text=All Users').locator('..');
    const userLi = allUserParent.locator('li', { hasText: newUser.username });
    await expect(userLi.first()).toBeVisible();

    const http = new HttpClient();
    const response = await http.get('admin/users', ApiConfig.adminAuth);
    const users = response?.data ?? response;
    const createdUser = users.find((u) => u.username === newUser.username);
    expect(createdUser, 'User must exist in backend list').toBeTruthy();
    await assertThatModels(new CreateUserRequest(newUser), createdUser).match();
  });

  test('admin should not be able to create a new user with invalid data', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('[placeholder="Username"]').fill('admin');
    await page.locator('[placeholder="Password"]').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForSelector('text=Admin Panel');

    const newUser = generateUser();
    newUser.username = 'a';
    await page.locator('[placeholder="Username"]').fill(newUser.username);
    await page.locator('[placeholder="Password"]').fill(newUser.password);

    const dialogPromise = page.waitForEvent('dialog');
    await page.click('text=Add User');
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain(
      'username: Username must be between 3 and 15 characters',
    );
    await dialog.accept();

    const allUserParent = page.locator('text=All Users').locator('..');
    const userLi = allUserParent.locator('li', {
      hasText: page.getByText(newUser.username, { exact: true }),
    });
    await expect(userLi).toHaveCount(0);

    const http = new HttpClient();
    const response = await http.get('admin/users', ApiConfig.adminAuth);
    const users = response?.data ?? response;
    const count = users.filter((u) => u.username === newUser.username).length;
    expect(count).toBe(0);
  });
});

//
