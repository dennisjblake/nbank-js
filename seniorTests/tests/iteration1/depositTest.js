import { expect } from 'chai';
import AdminCreateUserRequest from '../../requests/adminCreateUserRequest.js';
import GenerateTokenRequest from '../../requests/generateTokenRequest.js';
import DepositRequester from '../../requests/depositRequester.js';
import CreateAccountRequest from '../../requests/createAccountRequest.js';
import CustomerAccountsResponse from '../../models/customerAccountsResponse.js';
import CustomerAccountsRequester from '../../requests/customerAccountsRequester.js';
import ApiConfig from '../../utils/apiConfig.js';

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
      const user = await new AdminCreateUserRequest().createUser();
      expect(user.status).to.equal(201);
      const loginRequest = await new GenerateTokenRequest().login({
        username: user.response.username,
        password: user.response.password,
      });

      const authToken = loginRequest.headers.Authorization;
      // Create an account
      const {
        status: createAccountStatus,
        responseData: createAccountResponse,
      } = await new CreateAccountRequest().createAccount(authToken);

      expect(createAccountStatus).to.equal(201);
      expect(createAccountResponse.accountNumber).to.be.a('string').and.not
        .empty;

      // Deposit
      const { status: depositStatus, responseData: depositResponse } =
        await new DepositRequester().deposit(
          createAccountResponse.id,
          amount,
          authToken,
        );

      expect(depositStatus).equals(200);
      expect(depositResponse['balance']).equal(amount);
      expect(depositResponse['id']).equal(createAccountResponse.id);
      expect(depositResponse['accountNumber']).equal(
        createAccountResponse.accountNumber,
      );
      expect(depositResponse['transactions'][0].amount).equal(amount);
      expect(depositResponse['transactions'][0].relatedAccountId).equal(
        createAccountResponse.id,
      );
      expect(depositResponse['transactions'][0].type).equal('DEPOSIT');

      // verify account information
      const { status: accountStatus, responseData: accountResponse } =
        await new CustomerAccountsRequester().getAccounts(authToken);

      expect(accountStatus).equals(200);
      expect(accountResponse[0].balance).equal(amount);
      expect(accountResponse[0].id).equal(createAccountResponse.id);
      expect(accountResponse[0].accountNumber).equal(
        createAccountResponse.accountNumber,
      );
      expect(accountResponse[0].transactions[0].amount).equal(amount);
      expect(accountResponse[0].transactions[0].relatedAccountId).equal(
        createAccountResponse.id,
      );
      expect(accountResponse[0].transactions[0].type).equal('DEPOSIT');
    });
  });
  const invalidAmounts = [
    { amount: 0, errorMessage: 'Deposit amount must be at least 0.01' },
    { amount: -1, errorMessage: 'Deposit amount must be at least 0.01' },
    { amount: 5001, errorMessage: 'Deposit amount cannot exceed 5000' },
    { amount: 5000.1, errorMessage: 'Deposit amount cannot exceed 5000' },
  ];
  invalidAmounts.forEach(({ amount, errorMessage }) => {
    it(`user cannot deposit incorrect amount "${amount}" into his account`, async () => {
      // create a user
      const user = await new AdminCreateUserRequest().createUser();
      expect(user.status).to.equal(201);
      const loginRequest = await new GenerateTokenRequest().login({
        username: user.response.username,
        password: user.response.password,
      });

      const authToken = loginRequest.headers.Authorization;
      // Create an account
      const {
        status: createAccountStatus,
        responseData: createAccountResponse,
      } = await new CreateAccountRequest().createAccount(authToken);

      expect(createAccountStatus).to.equal(201);
      expect(createAccountResponse.accountNumber).to.be.a('string').and.not
        .empty;

      // Deposit
      const { status: depositStatus, responseData: depositResponse } =
        await new DepositRequester().deposit(
          createAccountResponse.id,
          amount,
          authToken,
        );

      expect(depositStatus).equals(400);
      expect(depositResponse).equal(errorMessage);

      // verify account information
      const { status: accountStatus, responseData: accountResponse } =
        await new CustomerAccountsRequester().getAccounts(authToken);

      expect(accountStatus).equals(200);
      expect(accountResponse[0].balance).equal(0);
      expect(accountResponse[0].id).equal(createAccountResponse.id);
    });
  });

  const invalidAccounts = [
    { account: 0, errorMessage: 'Unauthorized access to account' },
    { account: -1, errorMessage: 'Unauthorized access to account' },
  ];
  invalidAccounts.forEach(({ account, errorMessage }) => {
    it(`user cannot deposit correct amount into non owned account "${account}" into his account`, async () => {
      // create a user
      const user = await new AdminCreateUserRequest().createUser();
      expect(user.status).to.equal(201);
      const loginRequest = await new GenerateTokenRequest().login({
        username: user.response.username,
        password: user.response.password,
      });

      const authToken = loginRequest.headers.Authorization;
      // Create an account
      const {
        status: createAccountStatus,
        responseData: createAccountResponse,
      } = await new CreateAccountRequest().createAccount(authToken);

      expect(createAccountStatus).to.equal(201);
      expect(createAccountResponse.accountNumber).to.be.a('string').and.not
        .empty;

      // Deposit

      const { status: depositStatus, responseData: depositResponse } =
        await new DepositRequester().deposit(account, 100.0, authToken);

      expect(depositStatus).equals(403);
      expect(depositResponse).equal(errorMessage);
    });
  });
  it('admin cannot deposit correct amount into customer account', async () => {
    // create a user
    const user = await new AdminCreateUserRequest().createUser();
    expect(user.status).to.equal(201);
    const loginRequest = await new GenerateTokenRequest().login({
      username: user.response.username,
      password: user.response.password,
    });

    const authToken = loginRequest.headers.Authorization;
    // Create an account
    const { status: createAccountStatus, responseData: createAccountResponse } =
      await new CreateAccountRequest().createAccount(authToken);

    expect(createAccountStatus).to.equal(201);
    expect(createAccountResponse.accountNumber).to.be.a('string').and.not.empty;

    // deposit
    const { status: depositStatus, responseData: depositResponse } =
      await new DepositRequester().deposit(
        createAccountResponse.id,
        100.0,
        process.env.ADMIN_AUTH_TOKEN,
      );

    expect(depositStatus).equals(403);

    // verify account information
    const { status: accountStatus, responseData: accountResponse } =
      await new CustomerAccountsRequester().getAccounts(authToken);

    expect(accountStatus).equals(200);
    expect(accountResponse[0].balance).equal(0);
    expect(accountResponse[0].id).equal(createAccountResponse.id);
  });
});
