import { expect } from 'chai';
import { randomDepositAmountWithDecimals } from '../../generators/randomData.js';
import { assertThatModels } from '../../models/comparison/modelAssertions.js';
import ACCOUNT_VALUE from '../../utils/accountValue.js';
import HTTP_STATUS from '../../utils/httpStatus.js';
import MESSAGE from '../../utils/message.js';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { UserSteps } from '../../utils/steps/userSteps.js';

describe('API Deposit Tests', () => {
  const validAmounts = [
    { amount: 0.01 },
    { amount: 0.1 },
    { amount: 1 },
    { amount: 4999.99 },
    { amount: 4999 },
    { amount: 5000 },
  ];
  validAmounts.forEach(({ amount }) => {
    it(`user can deposit correct amount "${amount}" into his account`, async () => {
      // create a user
      const { token } = await AdminSteps.createUserAndLogin();

      // Create an account
      const { responseData: accountCreateData } =
        await UserSteps.createAccount(token);

      // Deposit
      const { data: depositResponse } = await UserSteps.depositSmart(
        accountCreateData,
        amount,
        token,
      );

      // verify account information
      const accountAfterDeposit = await UserSteps.getAccountById(
        accountCreateData.id,
        token,
      );
      expect(accountAfterDeposit.balance).to.equal(amount);
      await assertThatModels(accountCreateData, accountAfterDeposit).match();
    });
  });
  const invalidAmounts = [
    { amount: 0, errorMessage: MESSAGE.DEPOSIT_UNDER_LIMIT },
    { amount: -1, errorMessage: MESSAGE.DEPOSIT_UNDER_LIMIT },
    { amount: 5001, errorMessage: MESSAGE.DEPOSIT_OVER_LIMIT },
    { amount: 5000.1, errorMessage: MESSAGE.DEPOSIT_OVER_LIMIT },
  ];
  invalidAmounts.forEach(({ amount, errorMessage }) => {
    it(`user cannot deposit incorrect amount "${amount}" into his account`, async () => {
      // create a user
      const { token } = await AdminSteps.createUserAndLogin();

      // Create an account
      const { responseData: accountCreateData } =
        await UserSteps.createAccount(token);

      // Deposit
      await UserSteps.depositWithError(
        accountCreateData.id,
        amount,
        token,
        HTTP_STATUS.BAD_REQUEST,
        errorMessage,
      );

      // verify account information
      const accountAfterDeposit = await UserSteps.getAccountById(
        accountCreateData.id,
        token,
      );
      expect(accountAfterDeposit.balance).to.equal(ACCOUNT_VALUE.ZERO_VALUE);
      expect(accountAfterDeposit.id).to.equal(accountCreateData.id);
    });
  });

  const invalidAccounts = [
    { account: 0, errorMessage: MESSAGE.UNAUTH_ACCESS },
    { account: -1, errorMessage: MESSAGE.UNAUTH_ACCESS },
  ];
  invalidAccounts.forEach(({ account, errorMessage }) => {
    it(`user cannot deposit correct amount into non owned account "${account}" into his account`, async () => {
      const amount = randomDepositAmountWithDecimals();
      // create a user
      const { token } = await AdminSteps.createUserAndLogin();

      // Create an account
      const { responseData: accountCreateData } =
        await UserSteps.createAccount(token);

      // Deposit
      await UserSteps.depositWithError(
        accountCreateData.id,
        amount,
        token,
        HTTP_STATUS.FORBIDDEN,
        errorMessage,
      );
    });
  });
  it('admin cannot deposit correct amount into customer account', async () => {
    const amount = randomDepositAmountWithDecimals();
    // create a user
    const { token } = await AdminSteps.createUserAndLogin();

    // Create an account
    const { responseData: accountCreateData } =
      await UserSteps.createAccount(token);

    // Deposit
    await UserSteps.depositWithError(
      accountCreateData.id,
      amount,
      process.env.ADMIN_AUTH_TOKEN,
      HTTP_STATUS.UNAUTHORIZED,
    );

    // verify account information
    const accountAfterDeposit = await UserSteps.getAccountById(
      accountCreateData.id,
      token,
    );
    expect(accountAfterDeposit.balance).to.equal(ACCOUNT_VALUE.ZERO_VALUE);
    expect(accountAfterDeposit.id).to.equal(accountCreateData.id);
  });
});
