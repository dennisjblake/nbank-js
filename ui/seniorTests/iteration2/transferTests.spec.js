import { randomTransferAmountWithDecimalsBelow } from '../../../seniorTests/generators/randomData.js';
import { assertThatModels } from '../../../seniorTests/models/comparison/modelAssertions.js';
import ACCOUNT_VALUE from '../../../seniorTests/utils/accountValue.js';
import { expect, test } from '../../fixtures/baseUi.js';
import { BankAlert } from '../../pages/bankAlert.js';
import TransferPage from '../../pages/transferPage.js';
import URL from '../../pages/url.js';
import UserDashboard from '../../pages/userDashboard.js';

const TRANSFER_ALERT_RE =
  /^✅ Successfully transferred \$(?<amount>[\d.]+) to account (?<accountNumber>[\w-]+)!$/;

test.describe('UI Transfer Tests', () => {
  test('user can transfer correct amount from his account into other customer user account', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    // Create user1 and user2
    const [session1, session2] = await withUserSession(2);

    const { steps: user1steps, token: user1token } = session1;
    const { steps: user2steps, token: user2token } = session2;

    // Create an account1 for user1
    const { responseData: account1user1CreateData } =
      await user1steps.createAccount();

    // Create an account2 for user2
    const { responseData: account1user2CreateData } =
      await user2steps.createAccount();

    // Deposit 10k into account1 for user1
    await user1steps.depositSmart(
      account1user1CreateData,
      ACCOUNT_VALUE.VALUE_10K,
    );

    // login
    await authWithToken({ token: user1token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a transfer
    await userDashboard.openTransferPage();
    const transferPage = new TransferPage(page);
    await transferPage.expectLoaded();
    const alertText = await transferPage.checkAlertAndExtractAndAccept(
      BankAlert.SUCCESSFULL_TRANSFER_ALERT_TEXT,
      () =>
        transferPage.makeTransfer({
          senderAccount: account1user1CreateData,
          receiverAccount: account1user2CreateData,
          amount: transferAmount,
        }),
      TRANSFER_ALERT_RE,
    );

    // check the API result
    // verify account information
    const senderAccount = await user1steps.getAccountById(
      account1user1CreateData.id,
    );
    const receiverAccount = await user2steps.getAccountById(
      account1user2CreateData.id,
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
    withUserSession,
    authWithToken,
  }) => {
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    // Create user1
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // Create an account1 for user1
    const { responseData: account1user1CreateData } =
      await steps.createAccount();

    // Create an account2 for user1
    const { responseData: account2user1CreateData } =
      await steps.createAccount();

    // Deposit into account1 for user1
    await steps.depositSmart(account1user1CreateData, ACCOUNT_VALUE.VALUE_10K);

    // login
    await authWithToken({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a transfer
    await userDashboard.openTransferPage();
    const transferPage = new TransferPage(page);
    await transferPage.expectLoaded();
    const alertText = await transferPage.checkAlertAndExtractAndAccept(
      BankAlert.SUCCESSFULL_TRANSFER_ALERT_TEXT,
      () =>
        transferPage.makeTransfer({
          senderAccount: account1user1CreateData,
          receiverAccount: account2user1CreateData,
          amount: transferAmount,
        }),
      TRANSFER_ALERT_RE,
    );

    // check the API result
    // verify account information
    const senderAccount = await steps.getAccountById(
      account1user1CreateData.id,
    );
    const receiverAccount = await steps.getAccountById(
      account2user1CreateData.id,
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
    withUserSession,
    authWithToken,
  }) => {
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    // Create user1
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // Create an account1 for user1
    const { responseData: account1user1CreateData } =
      await steps.createAccount();

    // Deposit into account1 for user1
    await steps.depositSmart(account1user1CreateData, ACCOUNT_VALUE.VALUE_10K);

    // login
    await authWithToken({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a transfer
    await userDashboard.openTransferPage();
    const transferPage = new TransferPage(page);
    await transferPage.expectLoaded();
    const alertText = await transferPage.checkAlertAndAccept(
      BankAlert.TRANSFER_NO_USER_FOUND_WITH_ACC_NUMBER_ALERT_TEXT,
      () =>
        transferPage.makeTransfer({
          senderAccount: account1user1CreateData,
          receiverAccount: 0,
          amount: transferAmount,
        }),
    );

    // check the API result
    // verify account information
    const senderAccount = await steps.getAccountById(
      account1user1CreateData.id,
    );

    await assertThatModels(senderAccount, account1user1CreateData).match();
    expect(senderAccount.balance).toBe(ACCOUNT_VALUE.VALUE_10K);
  });

  test('user cannot transfer with leaving negative balance', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    // Create user1
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // Create an account1 for user1
    const { responseData: account1user1CreateData } =
      await steps.createAccount();

    // Create an account2 for user1
    const { responseData: account2user1CreateData } =
      await steps.createAccount();

    // login
    await authWithToken({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a transfer
    await userDashboard.openTransferPage();
    const transferPage = new TransferPage(page);
    await transferPage.expectLoaded();
    const alertText = await transferPage.checkAlertAndAccept(
      BankAlert.TRANSFER_NO_FUNDS_ALERT_TEXT,
      () =>
        transferPage.makeTransfer({
          senderAccount: account1user1CreateData,
          receiverAccount: account2user1CreateData,
          amount: transferAmount,
        }),
    );

    // check the API result
    // verify account information
    const senderAccount = await steps.getAccountById(
      account1user1CreateData.id,
    );
    const receiverAccount = await steps.getAccountById(
      account2user1CreateData.id,
    );
    await assertThatModels(senderAccount, account1user1CreateData).match();
    expect(senderAccount.balance).toBe(ACCOUNT_VALUE.ZERO_VALUE);
    await assertThatModels(receiverAccount, account2user1CreateData).match();
    expect(receiverAccount.balance).toBe(ACCOUNT_VALUE.ZERO_VALUE);
  });

  test('user cannot transfer without filling out all fields and confirmation', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const transferAmount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_10K,
    );
    // Create user1
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // login
    await authWithToken({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a transfer
    await userDashboard.openTransferPage();
    const transferPage = new TransferPage(page);
    await transferPage.expectLoaded();
    const alertText = await transferPage.checkAlertAndAccept(
      BankAlert.TRANSFER_FILL_ALL_FIELDS_ALERT_TEXT,
      () => transferPage.makeTransfer({ amount: transferAmount }),
    );
  });

  test('user cannot transfer invalid amount from his account into his account', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    // Create user1
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // Create an account1 for user1
    const { responseData: account1user1CreateData } =
      await steps.createAccount();

    // Create an account2 for user1
    const { responseData: account2user1CreateData } =
      await steps.createAccount();

    // Deposit into account1 for user1
    await steps.depositSmart(account1user1CreateData, ACCOUNT_VALUE.VALUE_5K);

    // login
    await authWithToken({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // make a transfer
    await userDashboard.openTransferPage();
    const transferPage = new TransferPage(page);
    await transferPage.expectLoaded();
    const alertText = await transferPage.checkAlertAndAccept(
      BankAlert.TRANSFER_BEYOND_LIMIT_ALERT_TEXT,
      () =>
        transferPage.makeTransfer({
          senderAccount: account1user1CreateData,
          receiverAccount: account2user1CreateData,
          amount: ACCOUNT_VALUE.ZERO_VALUE,
        }),
    );

    // check the API result
    // verify account information
    const senderAccount = await steps.getAccountById(
      account1user1CreateData.id,
    );
    const receiverAccount = await steps.getAccountById(
      account2user1CreateData.id,
    );
    await assertThatModels(senderAccount, account1user1CreateData).match();
    expect(senderAccount.balance).toBe(ACCOUNT_VALUE.VALUE_5K);
    await assertThatModels(receiverAccount, account2user1CreateData).match();
    expect(receiverAccount.balance).toBe(ACCOUNT_VALUE.ZERO_VALUE);
  });
});
