import { HttpStatusCode } from 'axios';
import { expect } from 'chai';
import { randomDepositAmountWithDecimals } from '../../generators/randomData.js';
import { assertThatModels } from '../../models/comparison/modelAssertions.js';
import ACCOUNT_VALUE from '../../utils/accountValue.js';
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
      const steps = new UserSteps({ token });

      // Create an account
      const { responseData: accountCreateData } = await steps.createAccount();

      // Deposit
      const { data: depositResponse } = await steps.depositSmart(
        accountCreateData,
        amount,
      );

      // verify account information
      const accountAfterDeposit = await steps.getAccountById(
        accountCreateData.id,
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
      const steps = new UserSteps({ token });

      // Create an account
      const { responseData: accountCreateData } = await steps.createAccount();

      // Deposit
      await steps.depositWithError({
        accountId: accountCreateData.id,
        amount: amount,
        httpCode: HttpStatusCode.BadRequest,
        errorMessage: errorMessage,
      });

      // verify account information
      const accountAfterDeposit = await steps.getAccountById(
        accountCreateData.id,
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
      const steps = new UserSteps({ token });

      // Create an account
      const { responseData: accountCreateData } = await steps.createAccount();

      // Deposit
      await steps.depositWithError({
        accountId: accountCreateData.id,
        amount: amount,
        httpCode: HttpStatusCode.Forbidden,
        errorMessage: errorMessage,
      });
    });
  });
  it('admin cannot deposit correct amount into customer account', async () => {
    const amount = randomDepositAmountWithDecimals();
    // create a user
    const { token } = await AdminSteps.createUserAndLogin();
    const steps = new UserSteps({ token });

    // Create an account
    const { responseData: accountCreateData } = await steps.createAccount();

    // Deposit
    await steps.depositWithError({
      accountId: accountCreateData.id,
      amount: amount,
      token: process.env.ADMIN_AUTH_TOKEN,
      httpCode: HttpStatusCode.Forbidden,
    });

    // verify account information
    const accountAfterDeposit = await steps.getAccountById(
      accountCreateData.id,
    );
    expect(accountAfterDeposit.balance).to.equal(ACCOUNT_VALUE.ZERO_VALUE);
    expect(accountAfterDeposit.id).to.equal(accountCreateData.id);
  });
});
