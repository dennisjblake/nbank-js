import { HttpStatusCode } from 'axios';
import { expect } from 'chai';
import { randomTransferAmountWithDecimalsBelow } from '../../generators/randomData.js';
import { assertThatModels } from '../../models/comparison/modelAssertions.js';
import ACCOUNT_VALUE from '../../utils/accountValue.js';
import MESSAGE from '../../utils/message.js';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { UserSteps } from '../../utils/steps/userSteps.js';

describe('API Transfer Tests', () => {
  const validAmounts = [
    { amount: 0.01 },
    { amount: 0.1 },
    { amount: 1 },
    { amount: 9999.99 },
    { amount: 9999 },
  ];

  validAmounts.forEach(({ amount }) => {
    it(`user can transfer correct amount ${amount} from his account into his account`, async () => {
      // create a user
      const { token } = await AdminSteps.createUserAndLogin();
      const steps = new UserSteps({ token });

      // Create account 1
      const { responseData: account1CreateData } = await steps.createAccount();

      // Create account 2
      const { responseData: account2CreateData } = await steps.createAccount();

      // deposit money 2 times to account 1
      const { data: depositResponse } = await steps.depositSmart(
        account1CreateData,
        ACCOUNT_VALUE.VALUE_10K,
      );

      // transfer money
      await steps.transfer(account1CreateData, account2CreateData, amount);

      // verify account information
      const senderAccount = await UserSteps.getAccountById(
        account1CreateData.id,
        token,
      );
      const receiverAccount = await UserSteps.getAccountById(
        account2CreateData.id,
        token,
      );

      expect(senderAccount).to.exist;
      expect(receiverAccount).to.exist;

      await assertThatModels(senderAccount, account1CreateData).match();
      expect(senderAccount.balance).to.be.closeTo(
        ACCOUNT_VALUE.VALUE_10K - amount,
        0.0001,
      );

      await assertThatModels(receiverAccount, account2CreateData).match();
      expect(receiverAccount.balance).to.equal(amount);
    });
  });
  validAmounts.forEach(({ amount }) => {
    it(`user can transfer correct amount ${amount} from his account into other customer account`, async () => {
      // create user 1
      const { token: authTokenUser1 } = await AdminSteps.createUserAndLogin();
      const stepsUser1 = new UserSteps({ token: authTokenUser1 });

      // create account 1 for user 1
      const { responseData: createAccount1User1Response } =
        await stepsUser1.createAccount();

      // create user 2
      const { token: authTokenUser2 } = await AdminSteps.createUserAndLogin();
      const stepsUser2 = new UserSteps({ token: authTokenUser2 });
      // create account 1 for user 2
      const { responseData: createAccount1User2Response } =
        await stepsUser2.createAccount();

      // deposit money 2 times to account 1 user 1
      await stepsUser1.depositSmart(
        createAccount1User1Response,
        ACCOUNT_VALUE.VALUE_10K,
      );

      // transfer money
      await stepsUser1.transfer(
        createAccount1User1Response,
        createAccount1User2Response,
        amount,
      );

      // verify account1 user1 information
      const senderAccount = await stepsUser1.getAccountById(
        createAccount1User1Response.id,
      );

      expect(senderAccount).to.exist;
      await assertThatModels(
        senderAccount,
        createAccount1User1Response,
      ).match();
      expect(senderAccount.balance).to.be.closeTo(
        ACCOUNT_VALUE.VALUE_10K - amount,
        0.0001,
      );

      // verify account1 user2 information
      const receiverAccount = await stepsUser2.getAccountById(
        createAccount1User2Response.id,
      );

      expect(receiverAccount).to.exist;
      await assertThatModels(
        receiverAccount,
        createAccount1User2Response,
      ).match();
      expect(receiverAccount.balance).to.equal(amount, 0.0001);
    });
  });

  const invalidAmounts = [
    { amount: 0, errorMessage: MESSAGE.TRANSFER_UNDER_LIMIT },
    { amount: -1, errorMessage: MESSAGE.TRANSFER_UNDER_LIMIT },
    { amount: 10001, errorMessage: MESSAGE.TRANSFER_OVER_LIMIT },
    { amount: 10000.01, errorMessage: MESSAGE.TRANSFER_OVER_LIMIT },
  ];

  invalidAmounts.forEach(({ amount, errorMessage }) => {
    it(`user cannot transfer invalid amount ${amount} from his account into his account`, async () => {
      // create a user
      const { token } = await AdminSteps.createUserAndLogin();
      const stepsUser1 = new UserSteps({ token: token });
      // Create account 1
      const { responseData: createAccount1User1Response } =
        await stepsUser1.createAccount();

      // Create account 2
      const { responseData: createAccount2User1Response } =
        await stepsUser1.createAccount();

      // deposit money 3 times to account 1
      await stepsUser1.depositSmart(
        createAccount1User1Response,
        ACCOUNT_VALUE.VALUE_15K,
      );

      // transfer money
      await stepsUser1.transferWithError(
        createAccount1User1Response,
        createAccount2User1Response,
        amount,
        HttpStatusCode.BadRequest,
        errorMessage,
      );

      // verify account information
      const senderAccount = await stepsUser1.getAccountById(
        createAccount1User1Response.id,
        token,
      );
      const receiverAccount = await stepsUser1.getAccountById(
        createAccount2User1Response.id,
        token,
      );

      expect(senderAccount).to.exist;
      expect(receiverAccount).to.exist;

      await assertThatModels(
        senderAccount,
        createAccount1User1Response,
      ).match();
      expect(senderAccount.balance).to.equal(ACCOUNT_VALUE.VALUE_15K);

      await assertThatModels(
        receiverAccount,
        createAccount2User1Response,
      ).match();
      expect(receiverAccount.balance).to.equal(ACCOUNT_VALUE.ZERO_VALUE);
    });
  });

  it('user cannot transfer with leaving negative balance', async () => {
    const amount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_5K,
    );
    // create a user
    const { token } = await AdminSteps.createUserAndLogin();
    const stepsUser1 = new UserSteps({ token });

    // Create account 1
    const { responseData: account1CreateData } =
      await stepsUser1.createAccount();

    // Create account 2
    const { responseData: account2CreateData } =
      await stepsUser1.createAccount();

    // transfer money
    await stepsUser1.transferWithError(
      account1CreateData,
      account2CreateData,
      amount,
      HttpStatusCode.BadRequest,
      MESSAGE.TRANSFER_NO_MONEY,
    );

    // verify account information
    const senderAccount = await stepsUser1.getAccountById(
      account1CreateData.id,
      token,
    );
    const receiverAccount = await stepsUser1.getAccountById(
      account2CreateData.id,
      token,
    );

    expect(senderAccount).to.exist;
    expect(receiverAccount).to.exist;

    await assertThatModels(senderAccount, account1CreateData).match();
    expect(senderAccount.balance).to.equal(ACCOUNT_VALUE.ZERO_VALUE);

    await assertThatModels(receiverAccount, account2CreateData).match();
    expect(receiverAccount.balance).to.equal(ACCOUNT_VALUE.ZERO_VALUE);
  });
  it('user cannot transfer correct amount from another user account into other user account', async () => {
    const amount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_5K,
    );
    // create user 1
    const { token: authTokenUser1 } = await AdminSteps.createUserAndLogin();
    const stepsUser1 = new UserSteps({ token: authTokenUser1 });

    // create user 2
    const { token: authTokenUser2 } = await AdminSteps.createUserAndLogin();
    const stepsUser2 = new UserSteps({ token: authTokenUser2 });

    // create user 3
    const { token: authTokenUser3 } = await AdminSteps.createUserAndLogin();
    const stepsUser3 = new UserSteps({ token: authTokenUser3 });

    // create account 1 for user 2
    const { responseData: createAccount1User2Response } =
      await stepsUser2.createAccount();

    // create account 1 for user 3
    const { responseData: createAccount1User3Response } =
      await stepsUser3.createAccount(authTokenUser3);

    // deposit money 1 time to account 1 user 2
    await stepsUser2.depositSmart(
      createAccount1User2Response,
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
    );

    // transfer money
    await stepsUser1.transferWithError(
      createAccount1User2Response,
      createAccount1User3Response,
      amount,
      HttpStatusCode.Forbidden,
      MESSAGE.UNAUTH_ACCESS,
    );

    // verify user2 and user3 information
    const senderAccount = await stepsUser2.getAccountById(
      createAccount1User2Response.id,
    );
    const receiverAccount = await stepsUser3.getAccountById(
      createAccount1User3Response.id,
    );

    expect(senderAccount).to.exist;
    expect(receiverAccount).to.exist;

    await assertThatModels(senderAccount, createAccount1User2Response).match();
    expect(senderAccount.balance).to.equal(ACCOUNT_VALUE.VALUE_5K);

    await assertThatModels(
      receiverAccount,
      createAccount1User3Response,
    ).match();
    expect(receiverAccount.balance).to.equal(ACCOUNT_VALUE.ZERO_VALUE);
  });

  it('user cannot transfer correct amount from another user account into his own account', async () => {
    const amount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
    );
    // create user 1
    const { token: authTokenUser1 } = await AdminSteps.createUserAndLogin();
    const stepsUser1 = new UserSteps({ token: authTokenUser1 });
    // create user 2
    const { token: authTokenUser2 } = await AdminSteps.createUserAndLogin();
    const stepsUser2 = new UserSteps({ token: authTokenUser2 });

    // create account 1 for user 1
    const { responseData: createAccount1User1Response } =
      await stepsUser1.createAccount();

    // create account 1 for user 2
    const { responseData: createAccount1User2Response } =
      await stepsUser2.createAccount();

    // deposit money 5000 to account 1 user 2
    await stepsUser2.depositSmart(
      createAccount1User2Response,
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
    );

    // transfer money
    await stepsUser1.transferWithError(
      createAccount1User2Response,
      createAccount1User1Response,
      amount,
      HttpStatusCode.Forbidden,
      MESSAGE.UNAUTH_ACCESS,
    );

    // verify accounts user1 and user2 information
    const senderAccount = await stepsUser2.getAccountById(
      createAccount1User2Response.id,
    );
    const receiverAccount = await stepsUser1.getAccountById(
      createAccount1User1Response.id,
    );

    expect(senderAccount).to.exist;
    expect(receiverAccount).to.exist;

    await assertThatModels(senderAccount, createAccount1User2Response).match();
    expect(senderAccount.balance).to.equal(ACCOUNT_VALUE.DEPOSIT_MAX_VALUE);

    await assertThatModels(
      receiverAccount,
      createAccount1User1Response,
    ).match();
    expect(receiverAccount.balance).to.equal(ACCOUNT_VALUE.ZERO_VALUE);
  });

  it('user can transfer correct amount from his account to the same account', async () => {
    const amount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
    );
    // create a user
    const { token } = await AdminSteps.createUserAndLogin();
    const stepsUser1 = new UserSteps({ token });

    // Create an account 1
    const { responseData: account1CreateData } =
      await stepsUser1.createAccount();

    // deposit 5000 to account 1
    await stepsUser1.depositSmart(
      account1CreateData,
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
    );

    // transfer money
    await stepsUser1.transfer(account1CreateData, account1CreateData, amount);

    // verify account information
    const senderAccount = await stepsUser1.getAccountById(
      account1CreateData.id,
    );
    expect(senderAccount).to.exist;
    await assertThatModels(senderAccount, account1CreateData).match();
    expect(senderAccount.balance).to.equal(ACCOUNT_VALUE.DEPOSIT_MAX_VALUE);
  });
});
