import { randomDepositAmountWithDecimals } from '../../../seniorTests/generators/randomData.js';
import { assertThatModels } from '../../../seniorTests/models/comparison/modelAssertions.js';
import ACCOUNT_VALUE from '../../../seniorTests/utils/accountValue.js';
import { expect, test } from '../../fixtures/baseUi.js';
import { BankAlert } from '../../pages/bankAlert.js';
import DepositMoney from '../../pages/depositMoneyPage.js';
import URL from '../../pages/url.js';
import UserDashboard from '../../pages/userDashboard.js';

const DEPOSIT_ALERT_RE =
  /^✅ Successfully deposited \$(?<amount>[\d.]+) to account (?<accountNumber>[\w-]+)!$/;

test.describe('UI Deposit Tests', () => {
  test('user can deposit correct amount into his account', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const amount = randomDepositAmountWithDecimals();
    // Create user and token
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // Create an account with API
    const { responseData: accountCreateData } = await steps.createAccount();

    // login
    await authWithToken({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a deposit
    await userDashboard.openDepositMoneyPage();
    const depositMoneyPage = new DepositMoney(page);
    await depositMoneyPage.expectLoaded();
    const alertText = await depositMoneyPage.checkAlertAndExtractAndAccept(
      BankAlert.SUCCESSFULL_DEPOSIT_ALERT_TEXT,
      () => depositMoneyPage.makeDeposit(accountCreateData.id, amount),
      DEPOSIT_ALERT_RE,
    );

    // check the API result
    const accountAfterDeposit = await steps.getAccountById(
      accountCreateData.id,
    );
    expect(accountAfterDeposit.balance).toBe(amount);
    await assertThatModels(accountCreateData, accountAfterDeposit).match();
  });
  test('user cannot deposit amount over limit into his account', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const amount = ACCOUNT_VALUE.VALUE_15K;
    // Create user and token
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // Create an account with API
    const { responseData: accountCreateData } = await steps.createAccount();

    // login
    await authWithToken({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a deposit
    await userDashboard.openDepositMoneyPage();
    const depositMoneyPage = new DepositMoney(page);
    await depositMoneyPage.expectLoaded();
    const alertText = await depositMoneyPage.checkAlertAndAccept(
      BankAlert.DESPOSIT_OVER_LIMIT_ALERT_TEXT,
      () => depositMoneyPage.makeDeposit(accountCreateData.id, amount),
    );

    // check the API result
    const accountAfterDeposit = await steps.getAccountById(
      accountCreateData.id,
    );
    expect(accountAfterDeposit.balance).toBe(ACCOUNT_VALUE.ZERO_VALUE);
  });
  test('user cannot deposit 0 amount into his account', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const amount = ACCOUNT_VALUE.ZERO_VALUE;
    // Create user and token
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // Create an account with API
    const { responseData: accountCreateData } = await steps.createAccount();

    // login
    await authWithToken({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a deposit
    await userDashboard.openDepositMoneyPage();
    const depositMoneyPage = new DepositMoney(page);
    await depositMoneyPage.expectLoaded();
    const alertText = await depositMoneyPage.checkAlertAndAccept(
      BankAlert.DESPOSIT_UNDER_LIMIT_ALERT_TEXT,
      () => depositMoneyPage.makeDeposit(accountCreateData.id, amount),
    );

    // check the API result
    const accountAfterDeposit = await steps.getAccountById(
      accountCreateData.id,
    );
    expect(accountAfterDeposit.balance).toBe(ACCOUNT_VALUE.ZERO_VALUE);
  });

  test('user cannot make a deposit if an account is not selected', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const amount = randomDepositAmountWithDecimals();
    // Create user and token
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // login
    await authWithToken({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a deposit
    await userDashboard.openDepositMoneyPage();
    const depositMoneyPage = new DepositMoney(page);
    await depositMoneyPage.expectLoaded();
    const alertText = await depositMoneyPage.checkAlertAndAccept(
      BankAlert.DEPOSIT_ACCOUNT_NOT_SELECTED_ALERT_TEXT,
      () => depositMoneyPage.makeDeposit(null, amount),
    );
  });
});
