import { expect } from 'chai';
import AdminCreateUserRequest from '../../requests/adminCreateUserRequest.js';
import GenerateTokenRequest from '../../requests/generateTokenRequest.js';
import DepositRequester from '../../requests/depositRequester.js';
import CreateAccountRequest from '../../requests/createAccountRequest.js';
import CustomerAccountsResponse from '../../models/customerAccountsResponse.js';
import CustomerAccountsRequester from '../../requests/customerAccountsRequester.js';
import ApiConfig from '../../utils/apiConfig.js';
import TransferRequester from '../../requests/transferRequester.js';
import { HttpStatusCode } from 'axios';

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
      const user = await new AdminCreateUserRequest().createUser();
      expect(user.status).to.equal(HttpStatusCode.Created);
      const loginRequest = await new GenerateTokenRequest().login({
        username: user.response.username,
        password: user.response.password,
      });
      const authToken = loginRequest.headers.Authorization;

      // Create an account 1
      const {
        status: createAccount1Status,
        responseData: createAccount1Response,
      } = await new CreateAccountRequest().createAccount(authToken);

      expect(createAccount1Status).to.equal(HttpStatusCode.Created);
      expect(createAccount1Response.accountNumber).to.be.a('string').and.not
        .empty;

      // Create an account 2
      const {
        status: createAccount2Status,
        responseData: createAccount2Response,
      } = await new CreateAccountRequest().createAccount(authToken);

      expect(createAccount2Status).to.equal(HttpStatusCode.Created);
      expect(createAccount2Response.accountNumber).to.be.a('string').and.not
        .empty;

      // deposit money 2 times to account 1
      await new DepositRequester().deposit(
        createAccount1Response.id,
        5000.0,
        authToken,
      );
      const { status: depositStatus, responseData: depositResponse } =
        await new DepositRequester().deposit(
          createAccount1Response.id,
          5000.0,
          authToken,
        );

      expect(depositStatus).equals(HttpStatusCode.Ok);
      expect(depositResponse.balance).equal(10000.0);
      expect(depositResponse.id).equal(createAccount1Response.id);
      expect(depositResponse.accountNumber).equal(
        createAccount1Response.accountNumber,
      );

      // transfer money
      const { status: transferStatus, responseData: transferResponse } =
        await new TransferRequester().transfer(
          createAccount1Response.id,
          createAccount2Response.id,
          amount,
          authToken,
        );

      expect(transferStatus).equal(200);
      expect(transferResponse.senderAccountId).equal(createAccount1Response.id);
      expect(transferResponse.receiverAccountId).equal(
        createAccount2Response.id,
      );
      expect(transferResponse.amount).equal(amount);
      expect(transferResponse.message).equal('Transfer successful');

      // verify account information
      const {
        status: customerAccountStatus,
        responseData: customerAccountsResponse,
      } = await new CustomerAccountsRequester().getAccounts(authToken);

      const account1 = customerAccountsResponse.find(
        (a) => a.id === createAccount1Response.id,
      );

      const account2 = customerAccountsResponse.find(
        (a) => a.id === createAccount2Response.id,
      );

      expect(account1).to.exist;
      expect(account2).to.exist;

      expect(account1.id).to.equal(createAccount1Response.id);
      expect(account1.accountNumber).to.equal(
        createAccount1Response.accountNumber,
      );
      expect(account1.balance).to.be.closeTo(10000.0 - amount, 0.0001);

      expect(account2.id).to.equal(createAccount2Response.id);
      expect(account2.accountNumber).to.equal(
        createAccount2Response.accountNumber,
      );
      expect(account2.balance).to.be.closeTo(amount, 0.0001);
    });
  });
  validAmounts.forEach(({ amount }) => {
    it(`user can transfer correct amount ${amount} from his account into other customer account`, async () => {
      // create user 1
      const user1 = await new AdminCreateUserRequest().createUser();
      expect(user1.status).to.equal(HttpStatusCode.Created);
      const loginRequestUser1 = await new GenerateTokenRequest().login({
        username: user1.response.username,
        password: user1.response.password,
      });

      const authTokenUser1 = loginRequestUser1.headers.Authorization;

      // create account 1 for user 1
      const {
        status: createAccount1User1Status,
        responseData: createAccount1User1Response,
      } = await new CreateAccountRequest().createAccount(authTokenUser1);

      expect(createAccount1User1Status).to.equal(HttpStatusCode.Created);
      expect(createAccount1User1Response.accountNumber).to.be.a('string').and
        .not.empty;

      // create user 2
      const user2 = await new AdminCreateUserRequest().createUser();
      expect(user2.status).to.equal(HttpStatusCode.Created);
      const loginRequestUser2 = await new GenerateTokenRequest().login({
        username: user2.response.username,
        password: user2.response.password,
      });

      const authTokenUser2 = loginRequestUser2.headers.Authorization;

      // create account 1 for user 2
      const {
        status: createAccount1User2Status,
        responseData: createAccount1User2Response,
      } = await new CreateAccountRequest().createAccount(authTokenUser2);

      expect(createAccount1User2Status).to.equal(HttpStatusCode.Created);
      expect(createAccount1User2Response.accountNumber).to.be.a('string').and
        .not.empty;

      // deposit money 2 times to account 1 user 1
      await new DepositRequester().deposit(
        createAccount1User1Response.id,
        5000.0,
        authTokenUser1,
      );
      const { status: depositStatus, responseData: depositResponse } =
        await new DepositRequester().deposit(
          createAccount1User1Response.id,
          5000.0,
          authTokenUser1,
        );

      expect(depositStatus).equals(HttpStatusCode.Ok);
      expect(depositResponse.balance).equal(10000.0);
      expect(depositResponse.id).equal(createAccount1User1Response.id);
      expect(depositResponse.accountNumber).equal(
        createAccount1User1Response.accountNumber,
      );

      // transfer money
      const { status: transferStatus, responseData: transferResponse } =
        await new TransferRequester().transfer(
          createAccount1User1Response.id,
          createAccount1User2Response.id,
          amount,
          authTokenUser1,
        );

      expect(transferStatus).equal(HttpStatusCode.Ok);
      expect(transferResponse.senderAccountId).equal(
        createAccount1User1Response.id,
      );
      expect(transferResponse.receiverAccountId).equal(
        createAccount1User2Response.id,
      );
      expect(transferResponse.amount).equal(amount);
      expect(transferResponse.message).equal('Transfer successful');

      // verify account1 user1 information
      const {
        status: senderAccountStatus,
        responseData: senderAccountsResponse,
      } = await new CustomerAccountsRequester().getAccounts(authTokenUser1);

      const senderAccount = senderAccountsResponse.find(
        (a) => a.id === createAccount1User1Response.id,
      );

      expect(senderAccount).to.exist;
      expect(senderAccount.id).to.equal(createAccount1User1Response.id);
      expect(senderAccount.accountNumber).to.equal(
        createAccount1User1Response.accountNumber,
      );
      expect(senderAccount.balance).to.be.closeTo(10000 - amount, 0.0001);

      // verify account1 user2 information
      const {
        status: receiverAccountStatus,
        responseData: receiverAccountsResponse,
      } = await new CustomerAccountsRequester().getAccounts(authTokenUser2);

      const receiverAccount = receiverAccountsResponse.find(
        (a) => a.id === createAccount1User2Response.id,
      );
      expect(receiverAccount).to.exist;
      expect(receiverAccount.id).to.equal(createAccount1User2Response.id);
      expect(receiverAccount.accountNumber).to.equal(
        createAccount1User2Response.accountNumber,
      );
      expect(receiverAccount.balance).to.be.closeTo(amount, 0.0001);
    });
  });

  const invalidAmounts = [
    { amount: 0, errorMessage: 'Transfer amount must be at least 0.01' },
    { amount: -1, errorMessage: 'Transfer amount must be at least 0.01' },
    { amount: 10001, errorMessage: 'Transfer amount cannot exceed 10000' },
    { amount: 10000.01, errorMessage: 'Transfer amount cannot exceed 10000' },
  ];

  invalidAmounts.forEach(({ amount, errorMessage }) => {
    it(`user cannot transfer invalid amount ${amount} from his account into his account`, async () => {
      // create a user
      const user = await new AdminCreateUserRequest().createUser();
      expect(user.status).to.equal(HttpStatusCode.Created);
      const loginRequest = await new GenerateTokenRequest().login({
        username: user.response.username,
        password: user.response.password,
      });
      const authToken = loginRequest.headers.Authorization;
      // Create an account 1
      const {
        status: createAccount1Status,
        responseData: createAccount1Response,
      } = await new CreateAccountRequest().createAccount(authToken);

      expect(createAccount1Status).to.equal(HttpStatusCode.Created);
      expect(createAccount1Response.accountNumber).to.be.a('string').and.not
        .empty;

      // Create an account 2
      const {
        status: createAccount2Status,
        responseData: createAccount2Response,
      } = await new CreateAccountRequest().createAccount(authToken);

      expect(createAccount2Status).to.equal(HttpStatusCode.Created);
      expect(createAccount2Response.accountNumber).to.be.a('string').and.not
        .empty;

      // deposit money 3 times to account 1
      await new DepositRequester().deposit(
        createAccount1Response.id,
        5000.0,
        authToken,
      );
      await new DepositRequester().deposit(
        createAccount1Response.id,
        5000.0,
        authToken,
      );
      const { status: depositStatus, responseData: depositResponse } =
        await new DepositRequester().deposit(
          createAccount1Response.id,
          5000.0,
          authToken,
        );

      expect(depositStatus).equals(HttpStatusCode.Ok);
      expect(depositResponse.balance).equal(15000.0);
      expect(depositResponse.id).equal(createAccount1Response.id);
      expect(depositResponse.accountNumber).equal(
        createAccount1Response.accountNumber,
      );

      // transfer money
      const { status: transferStatus, responseData: transferResponse } =
        await new TransferRequester().transfer(
          createAccount1Response.id,
          createAccount2Response.id,
          amount,
          authToken,
        );
      expect(transferStatus).equals(HttpStatusCode.BadRequest);
      expect(transferResponse).equal(errorMessage);

      // verify account information
      const {
        status: customerAccountStatus,
        responseData: customerAccountsResponse,
      } = await new CustomerAccountsRequester().getAccounts(authToken);

      const account1 = customerAccountsResponse.find(
        (a) => a.id === createAccount1Response.id,
      );

      const account2 = customerAccountsResponse.find(
        (a) => a.id === createAccount2Response.id,
      );

      expect(account1).to.exist;
      expect(account2).to.exist;

      expect(account1.id).to.equal(createAccount1Response.id);
      expect(account1.accountNumber).to.equal(
        createAccount1Response.accountNumber,
      );
      expect(account1.balance).to.equal(15000.0);

      expect(account2.id).to.equal(createAccount2Response.id);
      expect(account2.accountNumber).to.equal(
        createAccount2Response.accountNumber,
      );
      expect(account2.balance).to.be.equal(0.0);
    });
  });

  it('user cannot transfer with leaving negative balance', async () => {
    // create a user
    const user = await new AdminCreateUserRequest().createUser();
    expect(user.status).to.equal(HttpStatusCode.Created);
    const loginRequest = await new GenerateTokenRequest().login({
      username: user.response.username,
      password: user.response.password,
    });
    const authToken = loginRequest.headers.Authorization;
    // Create an account 1
    const {
      status: createAccount1Status,
      responseData: createAccount1Response,
    } = await new CreateAccountRequest().createAccount(authToken);

    expect(createAccount1Status).to.equal(HttpStatusCode.Created);
    expect(createAccount1Response.accountNumber).to.be.a('string').and.not
      .empty;

    // Create an account 2
    const {
      status: createAccount2Status,
      responseData: createAccount2Response,
    } = await new CreateAccountRequest().createAccount(authToken);

    expect(createAccount2Status).to.equal(HttpStatusCode.Created);
    expect(createAccount2Response.accountNumber).to.be.a('string').and.not
      .empty;

    // transfer money

    const { status: transferStatus, responseData: transferResponse } =
      await new TransferRequester().transfer(
        createAccount1Response.id,
        createAccount2Response.id,
        100.0,
        authToken,
      );
    expect(transferStatus).equals(HttpStatusCode.BadRequest);
    expect(transferResponse).equal(
      'Invalid transfer: insufficient funds or invalid accounts',
    );

    // verify account information
    const {
      status: customerAccountStatus,
      responseData: customerAccountsResponse,
    } = await new CustomerAccountsRequester().getAccounts(authToken);

    const account1 = customerAccountsResponse.find(
      (a) => a.id === createAccount1Response.id,
    );

    const account2 = customerAccountsResponse.find(
      (a) => a.id === createAccount2Response.id,
    );

    expect(account1).to.exist;
    expect(account2).to.exist;

    expect(account1.id).to.equal(createAccount1Response.id);
    expect(account1.accountNumber).to.equal(
      createAccount1Response.accountNumber,
    );
    expect(account1.balance).to.equal(0.0);

    expect(account2.id).to.equal(createAccount2Response.id);
    expect(account2.accountNumber).to.equal(
      createAccount2Response.accountNumber,
    );
    expect(account2.balance).to.be.equal(0.0);
  });
  it('user cannot transfer correct amount from another user account into other user account', async () => {
    // create user 1
    const user1 = await new AdminCreateUserRequest().createUser();
    expect(user1.status).to.equal(HttpStatusCode.Created);
    const loginRequestUser1 = await new GenerateTokenRequest().login({
      username: user1.response.username,
      password: user1.response.password,
    });
    const authTokenUser1 = loginRequestUser1.headers.Authorization;

    // create user 2
    const user2 = await new AdminCreateUserRequest().createUser();
    expect(user2.status).to.equal(HttpStatusCode.Created);
    const loginRequestUser2 = await new GenerateTokenRequest().login({
      username: user2.response.username,
      password: user2.response.password,
    });
    const authTokenUser2 = loginRequestUser2.headers.Authorization;

    // create user 3
    const user3 = await new AdminCreateUserRequest().createUser();
    expect(user3.status).to.equal(HttpStatusCode.Created);
    const loginRequestUser3 = await new GenerateTokenRequest().login({
      username: user3.response.username,
      password: user3.response.password,
    });
    const authTokenUser3 = loginRequestUser3.headers.Authorization;

    // create account 1 for user 2
    const {
      status: createAccount1User2Status,
      responseData: createAccount1User2Response,
    } = await new CreateAccountRequest().createAccount(authTokenUser2);

    expect(createAccount1User2Status).to.equal(HttpStatusCode.Created);
    expect(createAccount1User2Response.accountNumber).to.be.a('string').and.not
      .empty;

    // create account 1 for user 3
    const {
      status: createAccount1User3Status,
      responseData: createAccount1User3Response,
    } = await new CreateAccountRequest().createAccount(authTokenUser3);

    expect(createAccount1User3Status).to.equal(HttpStatusCode.Created);
    expect(createAccount1User3Response.accountNumber).to.be.a('string').and.not
      .empty;

    // deposit money 1 time to account 1 user 2
    const { status: depositStatus, responseData: depositResponse } =
      await new DepositRequester().deposit(
        createAccount1User2Response.id,
        5000.0,
        authTokenUser2,
      );

    expect(depositStatus).equals(HttpStatusCode.Ok);
    expect(depositResponse.balance).equal(5000.0);
    expect(depositResponse.id).equal(createAccount1User2Response.id);
    expect(depositResponse.accountNumber).equal(
      createAccount1User2Response.accountNumber,
    );

    // transfer money
    const { status: transferStatus, responseData: transferResponse } =
      await new TransferRequester().transfer(
        createAccount1User2Response.id,
        createAccount1User3Response.id,
        100.0,
        authTokenUser1,
      );

    expect(transferStatus).equals(HttpStatusCode.Forbidden);
    expect(transferResponse).equal('Unauthorized access to account');

    // verify account1 user2 information
    const {
      status: senderAccountStatus,
      responseData: senderAccountsResponse,
    } = await new CustomerAccountsRequester().getAccounts(authTokenUser2);

    const senderAccount = senderAccountsResponse.find(
      (a) => a.id === createAccount1User2Response.id,
    );

    expect(senderAccount).to.exist;
    expect(senderAccount.id).to.equal(createAccount1User2Response.id);
    expect(senderAccount.accountNumber).to.equal(
      createAccount1User2Response.accountNumber,
    );
    expect(senderAccount.balance).to.be.closeTo(5000.0, 0.0001);

    // verify account1 user3 information
    const {
      status: receiverAccountStatus,
      responseData: receiverAccountsResponse,
    } = await new CustomerAccountsRequester().getAccounts(authTokenUser3);

    const receiverAccount = receiverAccountsResponse.find(
      (a) => a.id === createAccount1User3Response.id,
    );
    expect(receiverAccount).to.exist;
    expect(receiverAccount.id).to.equal(createAccount1User3Response.id);
    expect(receiverAccount.accountNumber).to.equal(
      createAccount1User3Response.accountNumber,
    );
    expect(receiverAccount.balance).to.be.equal(0.0);
  });

  it('user cannot transfer correct amount from another user account into his own account', async () => {
    // create user 1
    const user1 = await new AdminCreateUserRequest().createUser();
    expect(user1.status).to.equal(HttpStatusCode.Created);
    const loginRequestUser1 = await new GenerateTokenRequest().login({
      username: user1.response.username,
      password: user1.response.password,
    });
    const authTokenUser1 = loginRequestUser1.headers.Authorization;

    // create user 2
    const user2 = await new AdminCreateUserRequest().createUser();
    expect(user2.status).to.equal(HttpStatusCode.Created);
    const loginRequestUser2 = await new GenerateTokenRequest().login({
      username: user2.response.username,
      password: user2.response.password,
    });
    const authTokenUser2 = loginRequestUser2.headers.Authorization;

    // create account 1 for user 1
    const {
      status: createAccount1User1Status,
      responseData: createAccount1User1Response,
    } = await new CreateAccountRequest().createAccount(authTokenUser1);

    expect(createAccount1User1Status).to.equal(HttpStatusCode.Created);
    expect(createAccount1User1Response.accountNumber).to.be.a('string').and.not
      .empty;

    // create account 1 for user 2
    const {
      status: createAccount1User2Status,
      responseData: createAccount1User2Response,
    } = await new CreateAccountRequest().createAccount(authTokenUser2);

    expect(createAccount1User2Status).to.equal(HttpStatusCode.Created);
    expect(createAccount1User2Response.accountNumber).to.be.a('string').and.not
      .empty;

    // deposit money 5000 to account 1 user 2
    const { status: depositStatus, responseData: depositResponse } =
      await new DepositRequester().deposit(
        createAccount1User2Response.id,
        5000.0,
        authTokenUser2,
      );

    expect(depositStatus).equals(HttpStatusCode.Ok);
    expect(depositResponse.balance).equal(5000.0);
    expect(depositResponse.id).equal(createAccount1User2Response.id);
    expect(depositResponse.accountNumber).equal(
      createAccount1User2Response.accountNumber,
    );

    // transfer money
    const { status: transferStatus, responseData: transferResponse } =
      await new TransferRequester().transfer(
        createAccount1User2Response.id,
        createAccount1User1Response.id,
        100.0,
        authTokenUser1,
      );
    expect(transferStatus).equal(HttpStatusCode.Forbidden);
    expect(transferResponse).equal('Unauthorized access to account');

    // verify account1 user2 information
    const {
      status: senderAccountStatus,
      responseData: senderAccountsResponse,
    } = await new CustomerAccountsRequester().getAccounts(authTokenUser2);

    const senderAccount = senderAccountsResponse.find(
      (a) => a.id === createAccount1User2Response.id,
    );

    expect(senderAccount).to.exist;
    expect(senderAccount.id).to.equal(createAccount1User2Response.id);
    expect(senderAccount.accountNumber).to.equal(
      createAccount1User2Response.accountNumber,
    );
    expect(senderAccount.balance).to.be.closeTo(5000.0, 0.0001);

    // verify account1 user2 information
    const {
      status: receiverAccountStatus,
      responseData: receiverAccountsResponse,
    } = await new CustomerAccountsRequester().getAccounts(authTokenUser1);

    const receiverAccount = receiverAccountsResponse.find(
      (a) => a.id === createAccount1User1Response.id,
    );
    expect(receiverAccount).to.exist;
    expect(receiverAccount.id).to.equal(createAccount1User1Response.id);
    expect(receiverAccount.accountNumber).to.equal(
      createAccount1User1Response.accountNumber,
    );
    expect(receiverAccount.balance).to.be.equal(0.0);
  });

  it('user can transfer correct amount from his account to the same account', async () => {
    // create a user
    const user = await new AdminCreateUserRequest().createUser();
    expect(user.status).to.equal(HttpStatusCode.Created);
    const loginRequest = await new GenerateTokenRequest().login({
      username: user.response.username,
      password: user.response.password,
    });
    const authToken = loginRequest.headers.Authorization;

    // Create an account 1
    const {
      status: createAccount1Status,
      responseData: createAccount1Response,
    } = await new CreateAccountRequest().createAccount(authToken);

    expect(createAccount1Status).to.equal(HttpStatusCode.Created);
    expect(createAccount1Response.accountNumber).to.be.a('string').and.not
      .empty;

    // deposit 5000 to account 1
    const { status: depositStatus, responseData: depositResponse } =
      await new DepositRequester().deposit(
        createAccount1Response.id,
        5000.0,
        authToken,
      );
    expect(depositStatus).equals(HttpStatusCode.Ok);
    expect(depositResponse.balance).equal(5000.0);
    expect(depositResponse.id).equal(createAccount1Response.id);
    expect(depositResponse.accountNumber).equal(
      createAccount1Response.accountNumber,
    );

    // transfer money
    const { status: transferStatus, responseData: transferResponse } =
      await new TransferRequester().transfer(
        createAccount1Response.id,
        createAccount1Response.id,
        100.0,
        authToken,
      );

    expect(transferStatus).equal(HttpStatusCode.Ok);
    expect(transferResponse.senderAccountId).equal(createAccount1Response.id);
    expect(transferResponse.receiverAccountId).equal(createAccount1Response.id);
    expect(transferResponse.amount).equal(100.0);
    expect(transferResponse.message).equal('Transfer successful');

    // verify account information
    const {
      status: senderAccountStatus,
      responseData: senderAccountsResponse,
    } = await new CustomerAccountsRequester().getAccounts(authToken);

    const senderAccount = senderAccountsResponse.find(
      (a) => a.id === createAccount1Response.id,
    );

    expect(senderAccount).to.exist;
    expect(senderAccount.id).to.equal(createAccount1Response.id);
    expect(senderAccount.accountNumber).to.equal(
      createAccount1Response.accountNumber,
    );
    expect(senderAccount.balance).to.be.closeTo(5000, 0.0001);
  });
});
