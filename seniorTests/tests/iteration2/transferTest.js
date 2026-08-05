import { expect } from 'chai';
import { randomTransferAmountWithDecimalsBelow } from '../../generators/randomData.js';
import { assertThatModels } from '../../models/comparison/modelAssertions.js';
import ACCOUNT_VALUE from '../../utils/accountValue.js';
import HTTP_STATUS from '../../utils/httpStatus.js';
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

      // Create account 1
      const { responseData: account1CreateData } =
        await UserSteps.createAccount(token);

      // Create account 2
      const { responseData: account2CreateData } =
        await UserSteps.createAccount(token);

      // deposit money 2 times to account 1
      const { data: depositResponse } = await UserSteps.depositSmart(
        account1CreateData,
        ACCOUNT_VALUE.VALUE_10K,
        token,
      );

      // transfer money
      const { status: transferStatus, data: transferResponse } =
        await UserSteps.transfer(
          account1CreateData.id,
          account2CreateData.id,
          amount,
          token,
        );

      expect(transferStatus).to.equal(200);
      expect(transferResponse.senderAccountId).to.equal(account1CreateData.id);
      expect(transferResponse.receiverAccountId).to.equal(
        account2CreateData.id,
      );
      expect(transferResponse.amount).to.equal(amount);
      expect(transferResponse.message).to.equal(
        MESSAGE.TRANSFER_SUCCESS_MESSAGE,
      );

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

      // create account 1 for user 1
      const { responseData: createAccount1User1Response } =
        await UserSteps.createAccount(authTokenUser1);

      // create user 2
      const { token: authTokenUser2 } = await AdminSteps.createUserAndLogin();

      // create account 1 for user 2
      const { responseData: createAccount1User2Response } =
        await UserSteps.createAccount(authTokenUser2);

      // deposit money 2 times to account 1 user 1
      const { data: depositResponse } = await UserSteps.depositSmart(
        createAccount1User1Response,
        ACCOUNT_VALUE.VALUE_10K,
        authTokenUser1,
      );

      // transfer money
      const { status: transferStatus, data: transferResponse } =
        await UserSteps.transfer(
          createAccount1User1Response.id,
          createAccount1User2Response.id,
          amount,
          authTokenUser1,
        );

      expect(transferStatus).to.equal(HTTP_STATUS.OK);
      expect(transferResponse.senderAccountId).to.equal(
        createAccount1User1Response.id,
      );
      expect(transferResponse.receiverAccountId).to.equal(
        createAccount1User2Response.id,
      );
      expect(transferResponse.amount).to.equal(amount);
      expect(transferResponse.message).to.equal(
        MESSAGE.TRANSFER_SUCCESS_MESSAGE,
      );

      // verify account1 user1 information
      const senderAccount = await UserSteps.getAccountById(
        createAccount1User1Response.id,
        authTokenUser1,
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
      const receiverAccount = await UserSteps.getAccountById(
        createAccount1User2Response.id,
        authTokenUser2,
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

      // Create account 1
      const { responseData: account1CreateData } =
        await UserSteps.createAccount(token);

      // Create account 2
      const { responseData: account2CreateData } =
        await UserSteps.createAccount(token);

      // deposit money 3 times to account 1
      const { data: depositResponse } = await UserSteps.depositSmart(
        account1CreateData,
        ACCOUNT_VALUE.VALUE_15K,
        token,
      );

      // transfer money
      await UserSteps.transferWithError(
        account1CreateData.id,
        account2CreateData.id,
        amount,
        HTTP_STATUS.BAD_REQUEST,
        errorMessage,
        token,
      );

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
      expect(senderAccount.balance).to.equal(ACCOUNT_VALUE.VALUE_15K);

      await assertThatModels(receiverAccount, account2CreateData).match();
      expect(receiverAccount.balance).to.equal(ACCOUNT_VALUE.ZERO_VALUE);
    });
  });

  it('user cannot transfer with leaving negative balance', async () => {
    const amount = randomTransferAmountWithDecimalsBelow(
      ACCOUNT_VALUE.VALUE_5K,
    );
    // create a user
    const { token } = await AdminSteps.createUserAndLogin();

    // Create account 1
    const { responseData: account1CreateData } =
      await UserSteps.createAccount(token);

    // Create account 2
    const { responseData: account2CreateData } =
      await UserSteps.createAccount(token);

    // transfer money
    await UserSteps.transferWithError(
      account1CreateData.id,
      account2CreateData.id,
      amount,
      HTTP_STATUS.BAD_REQUEST,
      MESSAGE.TRANSFER_NO_MONEY,
      token,
    );

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

    // create user 2
    const { token: authTokenUser2 } = await AdminSteps.createUserAndLogin();

    // create user 3
    const { token: authTokenUser3 } = await AdminSteps.createUserAndLogin();

    // create account 1 for user 2
    const { responseData: createAccount1User2Response } =
      await UserSteps.createAccount(authTokenUser2);

    // create account 1 for user 3
    const { responseData: createAccount1User3Response } =
      await UserSteps.createAccount(authTokenUser3);

    // deposit money 1 time to account 1 user 2
    const { data: depositResponse } = await UserSteps.depositSmart(
      createAccount1User2Response,
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
      authTokenUser2,
    );

    // transfer money
    await UserSteps.transferWithError(
      createAccount1User2Response.id,
      createAccount1User3Response.id,
      amount,
      HTTP_STATUS.FORBIDDEN,
      MESSAGE.UNAUTH_ACCESS,
      authTokenUser1,
    );

    // verify user2 and user3 information
    const senderAccount = await UserSteps.getAccountById(
      createAccount1User2Response.id,
      authTokenUser2,
    );
    const receiverAccount = await UserSteps.getAccountById(
      createAccount1User3Response.id,
      authTokenUser3,
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

    // create user 2
    const { token: authTokenUser2 } = await AdminSteps.createUserAndLogin();

    // create account 1 for user 1
    const { responseData: createAccount1User1Response } =
      await UserSteps.createAccount(authTokenUser1);

    // create account 1 for user 2
    const { responseData: createAccount1User2Response } =
      await UserSteps.createAccount(authTokenUser2);

    // deposit money 5000 to account 1 user 2
    const { data: depositResponse } = await UserSteps.depositSmart(
      createAccount1User2Response,
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
      authTokenUser2,
    );

    // transfer money
    await UserSteps.transferWithError(
      createAccount1User2Response.id,
      createAccount1User1Response.id,
      amount,
      HTTP_STATUS.FORBIDDEN,
      MESSAGE.UNAUTH_ACCESS,
      authTokenUser1,
    );

    // verify accounts user1 and user2 information
    const senderAccount = await UserSteps.getAccountById(
      createAccount1User2Response.id,
      authTokenUser2,
    );
    const receiverAccount = await UserSteps.getAccountById(
      createAccount1User1Response.id,
      authTokenUser1,
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

    // Create an account 1
    const { responseData: account1CreateData } =
      await UserSteps.createAccount(token);

    // deposit 5000 to account 1
    const { data: depositResponse } = await UserSteps.depositSmart(
      account1CreateData,
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
      token,
    );

    // transfer money
    const { status: transferStatus, data: transferResponse } =
      await UserSteps.transfer(
        account1CreateData.id,
        account1CreateData.id,
        amount,
        token,
      );

    expect(transferStatus).to.equal(HTTP_STATUS.OK);
    expect(transferResponse.senderAccountId).to.equal(account1CreateData.id);
    expect(transferResponse.receiverAccountId).to.equal(account1CreateData.id);
    expect(transferResponse.amount).to.equal(amount);
    expect(transferResponse.message).to.equal('Transfer successful');

    // verify account information
    const senderAccount = await UserSteps.getAccountById(
      account1CreateData.id,
      token,
    );
    expect(senderAccount).to.exist;
    await assertThatModels(senderAccount, account1CreateData).match();
    expect(senderAccount.balance).to.equal(ACCOUNT_VALUE.DEPOSIT_MAX_VALUE);
  });
});
