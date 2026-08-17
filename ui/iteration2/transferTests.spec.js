import { HttpStatusCode } from 'axios';
import { expect, test } from 'playwright/test';
import {
  randomDepositAmountWithDecimals,
  randomTransferAmountWithDecimalsBelow,
} from '../../seniorTests/generators/randomData.js';
import { assertThatModels } from '../../seniorTests/models/comparison/modelAssertions.js';
import ACCOUNT_VALUE from '../../seniorTests/utils/accountValue.js';
import { AdminSteps } from '../../seniorTests/utils/steps/adminSteps.js';
import { UserSteps } from '../../seniorTests/utils/steps/userSteps.js';

test.describe('UI Transfer Tests', () => {
  test('user can transfer correct amount from his account into other customer user account', async ({
    page,
  }) => {
    // Create user1 and user2
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    const {
      responseData: user1responseData,
      token: user1token,
      status: user1status,
    } = await AdminSteps.createUserAndLogin();
    expect(user1status).toBe(HttpStatusCode.Ok);

    const {
      responseData: user2responseData,
      token: user2token,
      status: user2status,
    } = await AdminSteps.createUserAndLogin();
    expect(user2status).toBe(HttpStatusCode.Ok);

    // Create an account1 for user1
    const {
      responseData: account1user1CreateData,
      status: account1user1CreateStatus,
    } = await UserSteps.createAccount(user1token);

    expect(account1user1CreateStatus).toBe(HttpStatusCode.Created);
    expect(account1user1CreateData.accountNumber).toBeTruthy();

    // Create an account2 for user2
    const {
      responseData: account1user2CreateData,
      status: account1user2CreateStatus,
    } = await UserSteps.createAccount(user2token);

    expect(account1user2CreateStatus).toBe(HttpStatusCode.Created);
    expect(account1user2CreateData.accountNumber).toBeTruthy();

    // Deposit into account1 for user1
    await UserSteps.deposit(
      account1user1CreateData.id,
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
      user1token,
    );
    const { status: depositStatus, data: depositResponse } =
      await UserSteps.deposit(
        account1user1CreateData.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        user1token,
      );

    expect(depositStatus).toBe(HttpStatusCode.Ok);
    expect(depositResponse['balance']).toBe(ACCOUNT_VALUE.VALUE_10K);
    await assertThatModels(account1user1CreateData, depositResponse).match();

    // login
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      user1token,
    );
    await page.goto('/dashboard');

    // make a transfer
    await page.getByText('🔄 Make a Transfer', { exact: true }).click();
    await expect(page).toHaveURL('/transfer');
    const pageTitleText = page.getByRole('heading', {
      name: '🔄 Make a Transfer',
    });
    await expect(pageTitleText).toBeVisible();
    await expect(pageTitleText).toHaveText('🔄 Make a Transfer');

    const accountSelector = page.locator('.account-selector');
    const senderAccountInput = accountSelector.locator('option', {
      hasText: account1user1CreateData.accountNumber,
    });
    await expect(senderAccountInput).toBeTruthy();
    await accountSelector.selectOption(String(account1user1CreateData.id));

    const recipientNameInput = page.locator(
      '[placeholder="Enter recipient name"]',
    );
    await recipientNameInput.fill(user2responseData.username);
    await expect(recipientNameInput).toHaveValue(user2responseData.username);

    const recipientAccountNumber = page.locator(
      '[placeholder="Enter recipient account number"]',
    );
    await recipientAccountNumber.fill(account1user2CreateData.accountNumber);
    await expect(recipientAccountNumber).toHaveValue(
      account1user2CreateData.accountNumber,
    );

    const amountInput = page.locator('[placeholder="Enter amount"]');
    await amountInput.fill(String(transferAmount));
    await expect(amountInput).toHaveValue(String(transferAmount));

    const confirmCheckbox = page.locator('#confirmCheck');
    await confirmCheckbox.check();
    await expect(confirmCheckbox).toBeChecked();

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain(
        `✅ Successfully transferred $${transferAmount} to account ${account1user2CreateData.accountNumber}!`,
      );
      await dialog.accept();
    });
    const postTransferPromise = page.waitForResponse(
      (response) =>
        response.url().includes('transfer') &&
        response.request().method() === 'POST' &&
        [200].includes(response.status()),
    );
    await page.getByText('🚀 Send Transfer', { exact: true }).click();

    await postTransferPromise;
    // check the API result
    // verify account information
    const senderAccount = await UserSteps.getAccountById(
      account1user1CreateData.id,
      user1token,
    );
    const receiverAccount = await UserSteps.getAccountById(
      account1user2CreateData.id,
      user2token,
    );

    await assertThatModels(senderAccount, account1user1CreateData).match();
    expect(senderAccount.balance).toBe(
      ACCOUNT_VALUE.VALUE_10K - transferAmount,
    );

    await assertThatModels(receiverAccount, account1user2CreateData).match();
    expect(receiverAccount.balance).toBe(transferAmount);
  });

  test('user can transfer correct amount from his account into his account', async ({
    page,
  }) => {
    // Create user1
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    const {
      responseData: user1responseData,
      token: user1token,
      status: user1status,
    } = await AdminSteps.createUserAndLogin();
    expect(user1status).toBe(HttpStatusCode.Ok);

    // Create an account1 for user1
    const {
      responseData: account1user1CreateData,
      status: account1user1CreateStatus,
    } = await UserSteps.createAccount(user1token);

    expect(account1user1CreateStatus).toBe(HttpStatusCode.Created);
    expect(account1user1CreateData.accountNumber).toBeTruthy();

    // Create an account2 for user1
    const {
      responseData: account2user1CreateData,
      status: account2user1CreateStatus,
    } = await UserSteps.createAccount(user1token);

    expect(account2user1CreateStatus).toBe(HttpStatusCode.Created);
    expect(account2user1CreateData.accountNumber).toBeTruthy();

    // Deposit into account1 for user1
    await UserSteps.deposit(
      account1user1CreateData.id,
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
      user1token,
    );
    const { status: depositStatus, data: depositResponse } =
      await UserSteps.deposit(
        account1user1CreateData.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        user1token,
      );

    expect(depositStatus).toBe(HttpStatusCode.Ok);
    expect(depositResponse['balance']).toBe(ACCOUNT_VALUE.VALUE_10K);
    await assertThatModels(account1user1CreateData, depositResponse).match();

    // login
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      user1token,
    );
    await page.goto('/dashboard');

    // make a transfer
    await page.getByText('🔄 Make a Transfer', { exact: true }).click();
    await expect(page).toHaveURL('/transfer');
    const pageTitleText = page.getByRole('heading', {
      name: '🔄 Make a Transfer',
    });
    await expect(pageTitleText).toBeVisible();
    await expect(pageTitleText).toHaveText('🔄 Make a Transfer');

    const accountSelector = page.locator('.account-selector');
    const senderAccountInput = accountSelector.locator('option', {
      hasText: account1user1CreateData.accountNumber,
    });
    await expect(senderAccountInput).toBeTruthy();
    await accountSelector.selectOption(String(account1user1CreateData.id));

    const recipientNameInput = page.locator(
      '[placeholder="Enter recipient name"]',
    );
    await recipientNameInput.fill(user1responseData.username);
    await expect(recipientNameInput).toHaveValue(user1responseData.username);

    const recipientAccountNumber = page.locator(
      '[placeholder="Enter recipient account number"]',
    );
    await recipientAccountNumber.fill(account2user1CreateData.accountNumber);
    await expect(recipientAccountNumber).toHaveValue(
      account2user1CreateData.accountNumber,
    );

    const amountInput = page.locator('[placeholder="Enter amount"]');
    await amountInput.fill(String(transferAmount));
    await expect(amountInput).toHaveValue(String(transferAmount));

    const confirmCheckbox = page.locator('#confirmCheck');
    await confirmCheckbox.check();
    await expect(confirmCheckbox).toBeChecked();

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain(
        `✅ Successfully transferred $${transferAmount} to account ${account2user1CreateData.accountNumber}!`,
      );
      await dialog.accept();
    });
    const postTransferPromise = page.waitForResponse(
      (response) =>
        response.url().includes('transfer') &&
        response.request().method() === 'POST' &&
        [200].includes(response.status()),
    );
    await page.getByText('🚀 Send Transfer', { exact: true }).click();

    await postTransferPromise;
    // check the API result
    // verify account information
    const senderAccount = await UserSteps.getAccountById(
      account1user1CreateData.id,
      user1token,
    );
    const receiverAccount = await UserSteps.getAccountById(
      account2user1CreateData.id,
      user1token,
    );

    await assertThatModels(senderAccount, account1user1CreateData).match();
    expect(senderAccount.balance).toBe(
      ACCOUNT_VALUE.VALUE_10K - transferAmount,
    );

    await assertThatModels(receiverAccount, account2user1CreateData).match();
    expect(receiverAccount.balance).toBe(transferAmount);
  });

  test('user cannot transfer correct amount from his account to incorrect account', async ({
    page,
  }) => {
    // Create user1
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    const {
      responseData: user1responseData,
      token: user1token,
      status: user1status,
    } = await AdminSteps.createUserAndLogin();
    expect(user1status).toBe(HttpStatusCode.Ok);

    // Create an account1 for user1
    const {
      responseData: account1user1CreateData,
      status: account1user1CreateStatus,
    } = await UserSteps.createAccount(user1token);

    expect(account1user1CreateStatus).toBe(HttpStatusCode.Created);
    expect(account1user1CreateData.accountNumber).toBeTruthy();

    // Deposit into account1 for user1
    await UserSteps.deposit(
      account1user1CreateData.id,
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
      user1token,
    );
    const { status: depositStatus, data: depositResponse } =
      await UserSteps.deposit(
        account1user1CreateData.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        user1token,
      );

    expect(depositStatus).toBe(HttpStatusCode.Ok);
    expect(depositResponse['balance']).toBe(ACCOUNT_VALUE.VALUE_10K);
    await assertThatModels(account1user1CreateData, depositResponse).match();

    // login
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      user1token,
    );
    await page.goto('/dashboard');

    // make a transfer
    await page.getByText('🔄 Make a Transfer', { exact: true }).click();
    await expect(page).toHaveURL('/transfer');
    const pageTitleText = page.getByRole('heading', {
      name: '🔄 Make a Transfer',
    });
    await expect(pageTitleText).toBeVisible();
    await expect(pageTitleText).toHaveText('🔄 Make a Transfer');

    const accountSelector = page.locator('.account-selector');
    const senderAccountInput = accountSelector.locator('option', {
      hasText: account1user1CreateData.accountNumber,
    });
    await expect(senderAccountInput).toBeTruthy();
    await accountSelector.selectOption(String(account1user1CreateData.id));

    const recipientNameInput = page.locator(
      '[placeholder="Enter recipient name"]',
    );
    await recipientNameInput.fill(user1responseData.username);
    await expect(recipientNameInput).toHaveValue(user1responseData.username);

    const recipientAccountNumber = page.locator(
      '[placeholder="Enter recipient account number"]',
    );
    await recipientAccountNumber.fill(String(0));
    await expect(recipientAccountNumber).toHaveValue(String(0));

    const amountInput = page.locator('[placeholder="Enter amount"]');
    await amountInput.fill(String(transferAmount));
    await expect(amountInput).toHaveValue(String(transferAmount));

    const confirmCheckbox = page.locator('#confirmCheck');
    await confirmCheckbox.check();
    await expect(confirmCheckbox).toBeChecked();

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain(`❌ No user found with this account number.`);
      await dialog.accept();
    });
    // check the API result
    // verify account information
    const senderAccount = await UserSteps.getAccountById(
      account1user1CreateData.id,
      user1token,
    );

    await assertThatModels(senderAccount, account1user1CreateData).match();
    expect(senderAccount.balance).toBe(ACCOUNT_VALUE.VALUE_10K);
  });

  test('user cannot transfer with leaving negative balance', async ({
    page,
  }) => {
    // Create user1
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    const {
      responseData: user1responseData,
      token: user1token,
      status: user1status,
    } = await AdminSteps.createUserAndLogin();
    expect(user1status).toBe(HttpStatusCode.Ok);

    // Create an account1 for user1
    const {
      responseData: account1user1CreateData,
      status: account1user1CreateStatus,
    } = await UserSteps.createAccount(user1token);

    expect(account1user1CreateStatus).toBe(HttpStatusCode.Created);
    expect(account1user1CreateData.accountNumber).toBeTruthy();

    // Create an account2 for user1
    const {
      responseData: account2user1CreateData,
      status: account2user1CreateStatus,
    } = await UserSteps.createAccount(user1token);

    expect(account2user1CreateStatus).toBe(HttpStatusCode.Created);
    expect(account2user1CreateData.accountNumber).toBeTruthy();

    // login
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      user1token,
    );
    await page.goto('/dashboard');

    // make a transfer
    await page.getByText('🔄 Make a Transfer', { exact: true }).click();
    await expect(page).toHaveURL('/transfer');
    const pageTitleText = page.getByRole('heading', {
      name: '🔄 Make a Transfer',
    });
    await expect(pageTitleText).toBeVisible();
    await expect(pageTitleText).toHaveText('🔄 Make a Transfer');

    const accountSelector = page.locator('.account-selector');
    const senderAccountInput = accountSelector.locator('option', {
      hasText: account1user1CreateData.accountNumber,
    });
    await expect(senderAccountInput).toBeTruthy();
    await accountSelector.selectOption(String(account1user1CreateData.id));

    const recipientNameInput = page.locator(
      '[placeholder="Enter recipient name"]',
    );
    await recipientNameInput.fill(user1responseData.username);
    await expect(recipientNameInput).toHaveValue(user1responseData.username);

    const recipientAccountNumber = page.locator(
      '[placeholder="Enter recipient account number"]',
    );
    await recipientAccountNumber.fill(account2user1CreateData.accountNumber);
    await expect(recipientAccountNumber).toHaveValue(
      account2user1CreateData.accountNumber,
    );

    const amountInput = page.locator('[placeholder="Enter amount"]');
    await amountInput.fill(String(transferAmount));
    await expect(amountInput).toHaveValue(String(transferAmount));

    const confirmCheckbox = page.locator('#confirmCheck');
    await confirmCheckbox.check();
    await expect(confirmCheckbox).toBeChecked();

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain(
        `❌ Error: Invalid transfer: insufficient funds or invalid accounts`,
      );
      await dialog.accept();
    });

    await page.getByText('🚀 Send Transfer', { exact: true }).click();
    // check the API result
    // verify account information
    const senderAccount = await UserSteps.getAccountById(
      account1user1CreateData.id,
      user1token,
    );
    const receiverAccount = await UserSteps.getAccountById(
      account2user1CreateData.id,
      user1token,
    );

    await assertThatModels(senderAccount, account1user1CreateData).match();
    expect(senderAccount.balance).toBe(ACCOUNT_VALUE.ZERO_VALUE);

    await assertThatModels(receiverAccount, account2user1CreateData).match();
    expect(receiverAccount.balance).toBe(ACCOUNT_VALUE.ZERO_VALUE);
  });

  test('user cannot transfer without filling out all fields and confirmation', async ({
    page,
  }) => {
    // Create user1
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    const {
      responseData: user1responseData,
      token: user1token,
      status: user1status,
    } = await AdminSteps.createUserAndLogin();
    expect(user1status).toBe(HttpStatusCode.Ok);

    // login
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      user1token,
    );
    await page.goto('/dashboard');

    // make a transfer
    await page.getByText('🔄 Make a Transfer', { exact: true }).click();
    await expect(page).toHaveURL('/transfer');
    const pageTitleText = page.getByRole('heading', {
      name: '🔄 Make a Transfer',
    });
    await expect(pageTitleText).toBeVisible();
    await expect(pageTitleText).toHaveText('🔄 Make a Transfer');

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain(`❌ Please fill all fields and confirm.`);
      await dialog.accept();
    });

    await page.getByText('🚀 Send Transfer', { exact: true }).click();
  });

  test('user cannot transfer invalid amount from his account into his account', async ({
    page,
  }) => {
    // Create user1
    const {
      responseData: user1responseData,
      token: user1token,
      status: user1status,
    } = await AdminSteps.createUserAndLogin();
    expect(user1status).toBe(HttpStatusCode.Ok);

    // Create an account1 for user1
    const {
      responseData: account1user1CreateData,
      status: account1user1CreateStatus,
    } = await UserSteps.createAccount(user1token);

    expect(account1user1CreateStatus).toBe(HttpStatusCode.Created);
    expect(account1user1CreateData.accountNumber).toBeTruthy();

    // Create an account2 for user1
    const {
      responseData: account2user1CreateData,
      status: account2user1CreateStatus,
    } = await UserSteps.createAccount(user1token);

    expect(account2user1CreateStatus).toBe(HttpStatusCode.Created);
    expect(account2user1CreateData.accountNumber).toBeTruthy();

    // Deposit into account1 for user1
    const { status: depositStatus, data: depositResponse } =
      await UserSteps.deposit(
        account1user1CreateData.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        user1token,
      );

    expect(depositStatus).toBe(HttpStatusCode.Ok);
    expect(depositResponse['balance']).toBe(ACCOUNT_VALUE.VALUE_5K);
    await assertThatModels(account1user1CreateData, depositResponse).match();

    // login
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      user1token,
    );
    await page.goto('/dashboard');

    // make a transfer
    await page.getByText('🔄 Make a Transfer', { exact: true }).click();
    await expect(page).toHaveURL('/transfer');
    const pageTitleText = page.getByRole('heading', {
      name: '🔄 Make a Transfer',
    });
    await expect(pageTitleText).toBeVisible();
    await expect(pageTitleText).toHaveText('🔄 Make a Transfer');

    const accountSelector = page.locator('.account-selector');
    const senderAccountInput = accountSelector.locator('option', {
      hasText: account1user1CreateData.accountNumber,
    });
    await expect(senderAccountInput).toBeTruthy();
    await accountSelector.selectOption(String(account1user1CreateData.id));

    const recipientNameInput = page.locator(
      '[placeholder="Enter recipient name"]',
    );
    await recipientNameInput.fill(user1responseData.username);
    await expect(recipientNameInput).toHaveValue(user1responseData.username);

    const recipientAccountNumber = page.locator(
      '[placeholder="Enter recipient account number"]',
    );
    await recipientAccountNumber.fill(account2user1CreateData.accountNumber);
    await expect(recipientAccountNumber).toHaveValue(
      account2user1CreateData.accountNumber,
    );

    const amountInput = page.locator('[placeholder="Enter amount"]');
    await amountInput.fill(String(0));
    await expect(amountInput).toHaveValue(String(0));

    const confirmCheckbox = page.locator('#confirmCheck');
    await confirmCheckbox.check();
    await expect(confirmCheckbox).toBeChecked();

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain(
        `❌ Error: Transfer amount must be at least 0.01`,
      );
      await dialog.accept();
    });
    await page.getByText('🚀 Send Transfer', { exact: true }).click();

    // check the API result
    // verify account information
    const senderAccount = await UserSteps.getAccountById(
      account1user1CreateData.id,
      user1token,
    );
    const receiverAccount = await UserSteps.getAccountById(
      account2user1CreateData.id,
      user1token,
    );

    await assertThatModels(senderAccount, account1user1CreateData).match();
    expect(senderAccount.balance).toBe(ACCOUNT_VALUE.VALUE_5K);

    await assertThatModels(receiverAccount, account2user1CreateData).match();
    expect(receiverAccount.balance).toBe(ACCOUNT_VALUE.ZERO_VALUE);
  });
});
