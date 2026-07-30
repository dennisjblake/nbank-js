import { HttpStatusCode } from 'axios';
import { expect, test } from 'playwright/test';
import { AdminSteps } from '../../../seniorTests/utils/steps/adminSteps.js';
import { UserSteps } from '../../../seniorTests/utils/steps/userSteps.js';

test.describe('Account Service Tests', () => {
  test('user should be able to create an account', async ({ page }) => {
    const { requestData, token, status } =
      await AdminSteps.createUserAndLogin();
    expect(status).toBe(HttpStatusCode.Ok);
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      token,
    );

    await page.goto('/dashboard');

    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
      page.getByText('➕ Create New Account', { exact: true }).click(),
    ]);

    const message = dialog.message();
    expect(message).toContain('✅ New Account Created! Account Number: ');
    await dialog.accept();

    const match = message.match(/Account Number:\s*([A-Za-z0-9_-]+)/);
    expect(match, 'Account number must be in alert test').toBeTruthy();
    const createdAccountNumber = match[1];

    const { status: accountStatus, data: accounts } =
      await UserSteps.getUserAccounts(token);

    expect(accountStatus).toBe(HttpStatusCode.Ok);
    expect(Array.isArray(accounts)).toBeTruthy();

    const createAccount = accounts.find(
      (a) => a.accountNumber === createdAccountNumber,
    );
    expect(createAccount, 'Created account must exist in backend list')
      .toBeTruthy;
    expect(createAccount.balance).toBe(0);

    expect(accounts.length).toBe(1);
  });
});
