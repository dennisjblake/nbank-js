import { HttpStatusCode } from 'axios';
import { expect, test } from 'playwright/test';
import { assertThatModels } from '../../seniorTests/models/comparison/modelAssertions.js';
import {
  randomAlphabeticString,
  randomDepositAmountWithDecimals,
} from '../../seniorTests/generators/randomData.js';
import ACCOUNT_VALUE from '../../seniorTests/utils/accountValue.js';
import { AdminSteps } from '../../seniorTests/utils/steps/adminSteps.js';
import { UserSteps } from '../../seniorTests/utils/steps/userSteps.js';

test.describe('UI Deposit Tests', () => {
  test('user can deposit correct amount into his account', async ({ page }) => {
    // Create user and login
    const amount = randomDepositAmountWithDecimals();
    const { requestData, token, status } =
      await AdminSteps.createUserAndLogin();
    expect(status).toBe(HttpStatusCode.Ok);

    // Create an account
    const { responseData: accountCreateData, status: accountCreateStatus } =
      await UserSteps.createAccount(token);

    expect(accountCreateStatus).toBe(HttpStatusCode.Created);
    expect(accountCreateData.accountNumber).toBeTruthy;

    // login
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      token,
    );
    await page.goto('/dashboard');

    // make a deposit
    await page.getByText('💰 Deposit Money', { exact: true }).click();
    await expect(page).toHaveURL('/deposit');
    const pageTitleText = page.getByRole('heading', {
      name: '💰 Deposit Money',
    });
    await expect(pageTitleText).toBeVisible;
    await expect(pageTitleText).toHaveText('💰 Deposit Money');

    const accountSelector = page.locator('.account-selector');
    const depositAccount = accountSelector.locator('option', {
      hasText: accountCreateData.accountNumber,
    });
    await expect(depositAccount).toBeTruthy();
    await accountSelector.selectOption(String(accountCreateData.id));

    await page.locator('.deposit-input').fill(String(amount));
    await expect(page.locator('.deposit-input')).toHaveValue(String(amount));
    const postDepositPromise = page.waitForResponse(
      (response) =>
        response.url().includes('deposit') &&
        response.request().method() === 'POST' &&
        [200].includes(response.status()),
    );
    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain(
        `✅ Successfully deposited $${amount} to account ${accountCreateData.accountNumber}!`,
      );
      await dialog.accept();
    });
    await page.getByText('💵 Deposit', { exact: true }).click();
    await postDepositPromise;
    // check the API result
    const accountAfterDeposit = await UserSteps.getAccountById(
      accountCreateData.id,
      token,
    );
    expect(accountAfterDeposit.balance).toBe(amount);
    await assertThatModels(accountCreateData, accountAfterDeposit).match();
  });
});
