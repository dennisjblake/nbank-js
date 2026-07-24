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
      const { requestData } = await AdminSteps.createUser();
      const { status: loginStatus, token } = await UserSteps.login(requestData);
      expect(loginStatus).to.equal(HTTP_STATUS.OK);

      // Create account 1
      const { responseData: account1CreateData, status: account1CreateStatus } =
        await UserSteps.createAccount(token);

      expect(account1CreateStatus).to.equal(HTTP_STATUS.CREATED);
      expect(account1CreateData.accountNumber).to.exist;

      // Create account 2
      const { responseData: account2CreateData, status: account2CreateStatus } =
        await UserSteps.createAccount(token);

      expect(account2CreateStatus).to.equal(HTTP_STATUS.CREATED);
      expect(account2CreateData.accountNumber).to.exist;

      // deposit money 2 times to account 1
      await UserSteps.deposit(
        account1CreateData.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        token,
      );
      const { status: depositStatus, data: depositResponse } =
        await UserSteps.deposit(
          account1CreateData.id,
          ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
          token,
        );

      expect(depositStatus).to.equal(HTTP_STATUS.OK);
      expect(depositResponse['balance']).to.equal(ACCOUNT_VALUE.VALUE_10K);
      await assertThatModels(account1CreateData, depositResponse).match();

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
      const { requestData: requestDataUser1 } = await AdminSteps.createUser();
      const { status: loginStatusUser1, token: authTokenUser1 } =
        await UserSteps.login(requestDataUser1);
      expect(loginStatusUser1).to.equal(HTTP_STATUS.OK);

      // create account 1 for user 1
      const {
        responseData: createAccount1User1Response,
        status: createAccount1User1Status,
      } = await UserSteps.createAccount(authTokenUser1);

      expect(createAccount1User1Status).to.equal(HTTP_STATUS.CREATED);
      expect(createAccount1User1Response.accountNumber).to.exist;

      // create user 2
      const { requestData: requestDataUser2 } = await AdminSteps.createUser();
      const { status: loginStatusUser2, token: authTokenUser2 } =
        await UserSteps.login(requestDataUser2);
      expect(loginStatusUser2).to.equal(HTTP_STATUS.OK);

      // create account 1 for user 2
      const {
        responseData: createAccount1User2Response,
        status: createAccount1User2Status,
      } = await UserSteps.createAccount(authTokenUser2);

      expect(createAccount1User2Status).to.equal(HTTP_STATUS.CREATED);
      expect(createAccount1User2Response.accountNumber).to.exist;

      // deposit money 2 times to account 1 user 1
      await UserSteps.deposit(
        createAccount1User1Response.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        authTokenUser1,
      );
      const { status: depositStatus, data: depositResponse } =
        await UserSteps.deposit(
          createAccount1User1Response.id,
          ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
          authTokenUser1,
        );

      expect(depositStatus).to.equal(HTTP_STATUS.OK);
      expect(depositResponse['balance']).to.equal(ACCOUNT_VALUE.VALUE_10K);
      await assertThatModels(
        createAccount1User1Response,
        depositResponse,
      ).match();

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
      const { requestData } = await AdminSteps.createUser();
      const { status: loginStatus, token } = await UserSteps.login(requestData);
      expect(loginStatus).to.equal(HTTP_STATUS.OK);

      // Create account 1
      const { responseData: account1CreateData, status: account1CreateStatus } =
        await UserSteps.createAccount(token);

      expect(account1CreateStatus).to.equal(HTTP_STATUS.CREATED);
      expect(account1CreateData.accountNumber).to.exist;

      // Create account 2
      const { responseData: account2CreateData, status: account2CreateStatus } =
        await UserSteps.createAccount(token);

      expect(account2CreateStatus).to.equal(HTTP_STATUS.CREATED);
      expect(account2CreateData.accountNumber).to.exist;

      // deposit money 3 times to account 1
      await UserSteps.deposit(
        account1CreateData.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        token,
      );
      await UserSteps.deposit(
        account1CreateData.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        token,
      );
      const { status: depositStatus, data: depositResponse } =
        await UserSteps.deposit(
          account1CreateData.id,
          ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
          token,
        );

      expect(depositStatus).to.equal(HTTP_STATUS.OK);
      expect(depositResponse['balance']).to.equal(ACCOUNT_VALUE.VALUE_15K);
      await assertThatModels(account1CreateData, depositResponse).match();

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
    const { requestData } = await AdminSteps.createUser();
    const { status: loginStatus, token } = await UserSteps.login(requestData);
    expect(loginStatus).to.equal(HTTP_STATUS.OK);

    // Create account 1
    const { responseData: account1CreateData, status: account1CreateStatus } =
      await UserSteps.createAccount(token);

    expect(account1CreateStatus).to.equal(HTTP_STATUS.CREATED);
    expect(account1CreateData.accountNumber).to.exist;

    // Create account 2
    const { responseData: account2CreateData, status: account2CreateStatus } =
      await UserSteps.createAccount(token);

    expect(account2CreateStatus).to.equal(HTTP_STATUS.CREATED);
    expect(account2CreateData.accountNumber).to.exist;

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
    const { requestData: requestDataUser1 } = await AdminSteps.createUser();
    const { status: loginStatusUser1, token: authTokenUser1 } =
      await UserSteps.login(requestDataUser1);
    expect(loginStatusUser1).to.equal(HTTP_STATUS.OK);

    // create user 2
    const { requestData: requestDataUser2 } = await AdminSteps.createUser();
    const { status: loginStatusUser2, token: authTokenUser2 } =
      await UserSteps.login(requestDataUser2);
    expect(loginStatusUser2).to.equal(HTTP_STATUS.OK);

    // create user 3
    const { requestData: requestDataUser3 } = await AdminSteps.createUser();
    const { status: loginStatusUser3, token: authTokenUser3 } =
      await UserSteps.login(requestDataUser3);
    expect(loginStatusUser3).to.equal(HTTP_STATUS.OK);

    // create account 1 for user 2
    const {
      responseData: createAccount1User2Response,
      status: createAccount1User2Status,
    } = await UserSteps.createAccount(authTokenUser2);

    expect(createAccount1User2Status).to.equal(HTTP_STATUS.CREATED);
    expect(createAccount1User2Response.accountNumber).to.exist;

    // create account 1 for user 3
    const {
      responseData: createAccount1User3Response,
      status: createAccount1User3Status,
    } = await UserSteps.createAccount(authTokenUser3);

    expect(createAccount1User3Status).to.equal(HTTP_STATUS.CREATED);
    expect(createAccount1User3Response.accountNumber).to.exist;

    // deposit money 1 time to account 1 user 2
    const { status: depositStatus, data: depositResponse } =
      await UserSteps.deposit(
        createAccount1User2Response.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        authTokenUser2,
      );

    expect(depositStatus).to.equal(HTTP_STATUS.OK);
    expect(depositResponse['balance']).to.equal(ACCOUNT_VALUE.VALUE_5K);
    await assertThatModels(
      createAccount1User2Response,
      depositResponse,
    ).match();

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
    const { requestData: requestDataUser1 } = await AdminSteps.createUser();
    const { status: loginStatusUser1, token: authTokenUser1 } =
      await UserSteps.login(requestDataUser1);
    expect(loginStatusUser1).to.equal(HTTP_STATUS.OK);

    // create user 2
    const { requestData: requestDataUser2 } = await AdminSteps.createUser();
    const { status: loginStatusUser2, token: authTokenUser2 } =
      await UserSteps.login(requestDataUser2);
    expect(loginStatusUser2).to.equal(HTTP_STATUS.OK);

    // create account 1 for user 1
    const {
      responseData: createAccount1User1Response,
      status: createAccount1User1Status,
    } = await UserSteps.createAccount(authTokenUser1);

    expect(createAccount1User1Status).to.equal(HTTP_STATUS.CREATED);
    expect(createAccount1User1Response.accountNumber).to.exist;

    // create account 1 for user 2
    const {
      responseData: createAccount1User2Response,
      status: createAccount1User2Status,
    } = await UserSteps.createAccount(authTokenUser2);

    expect(createAccount1User2Status).to.equal(HTTP_STATUS.CREATED);
    expect(createAccount1User2Response.accountNumber).to.exist;

    // deposit money 5000 to account 1 user 2
    const { status: depositStatus, data: depositResponse } =
      await UserSteps.deposit(
        createAccount1User2Response.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        authTokenUser2,
      );

    expect(depositStatus).to.equal(HTTP_STATUS.OK);
    expect(depositResponse['balance']).to.equal(
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
    );
    await assertThatModels(
      createAccount1User2Response,
      depositResponse,
    ).match();

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
    const { requestData } = await AdminSteps.createUser();
    const { status: loginStatus, token } = await UserSteps.login(requestData);
    expect(loginStatus).to.equal(HTTP_STATUS.OK);

    // Create an account 1
    const { responseData: account1CreateData, status: account1CreateStatus } =
      await UserSteps.createAccount(token);

    expect(account1CreateStatus).to.equal(HTTP_STATUS.CREATED);
    expect(account1CreateData.accountNumber).to.exist;

    // deposit 5000 to account 1
    const { status: depositStatus, data: depositResponse } =
      await UserSteps.deposit(
        account1CreateData.id,
        ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
        token,
      );

    expect(depositStatus).to.equal(HTTP_STATUS.OK);
    expect(depositResponse['balance']).to.equal(
      ACCOUNT_VALUE.DEPOSIT_MAX_VALUE,
    );
    await assertThatModels(account1CreateData, depositResponse).match();

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
