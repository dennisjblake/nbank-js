import { HttpStatusCode } from 'axios';
import { AdminSteps } from '../../../seniorTests/utils/steps/adminSteps.js';
import { UserSteps } from '../../../seniorTests/utils/steps/userSteps.js';
import { expect, test } from '../../fixtures/baseUi.js';
import { BankAlert } from '../../pages/bankAlert.js';
import URL from '../../pages/url.js';
import UserDashboard from '../../pages/userDashboard.js';

const ACCOUNT_NUMBER_RE = /Account Number:\s*([\w-]+)/;

test.describe('Accounts Service Tests', () => {
  test('user should be able to create an account', async ({
    page,
    authAsUser,
  }) => {
    const { token } = await AdminSteps.createUserAndLogin();
    await authAsUser({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    const accountNumber = await userDashboard.checkAlertAndExtractAndAccept(
      BankAlert.NEW_ACCOUNT_ADDED,
      () => userDashboard.createAccount(),
      ACCOUNT_NUMBER_RE,
    );

    expect(accountNumber).toBeTruthy();

    const userSteps = new UserSteps({ token });
    const { status: userStepsStatus, data: accounts } =
      await userSteps.getUserAccounts();

    expect(userStepsStatus).toBe(HttpStatusCode.Ok);
    expect(Array.isArray(accounts)).toBe(true);

    const created = accounts.find((a) => a.accountNumber === accountNumber);
    expect(created, `Account ${accountNumber} not found`).toBeTruthy();
    expect(created.balance).toBe(0);
    expect(accounts).toHaveLength(1);
  });
});
