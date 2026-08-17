import { HttpStatusCode } from 'axios';
import { expect, test } from '../../fixtures/baseUi.js';
import { BankAlert } from '../../pages/bankAlert.js';
import URL from '../../pages/url.js';
import UserDashboard from '../../pages/userDashboard.js';

const ACCOUNT_NUMBER_RE = /Account Number:\s*([\w-]+)/;

test.describe('Account Service Tests', () => {
  test('user should be able to create an account', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    await authWithToken({ token, goto: URL.DASHBOARD });

    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    const accountNumber = await userDashboard.checkAlertAndExtractAndAccept(
      BankAlert.NEW_ACCOUNT_ADDED,
      () => userDashboard.createAccount(),
      ACCOUNT_NUMBER_RE,
    );

    expect(accountNumber).toBeTruthy();

    const { status: accStatus, data: accounts } = await steps.getUserAccounts();
    expect(accStatus).toBe(HttpStatusCode.Ok);
    expect(Array.isArray(accounts)).toBe(true);

    const created = accounts.find((a) => a.accountNumber === accountNumber);
    expect(created).toBeTruthy();
    expect(created.balance).toBe(0);
  });
});
