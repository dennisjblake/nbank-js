import axios from 'axios';
import { expect } from 'chai';

const baseUrl = 'http://localhost:4111/api/v1';

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
      const randomName = Math.random().toString(36).substring(2, 12);
      // creating a new user
      const createUserResponse = await axios.post(
        `${baseUrl}/admin/users`,
        {
          username: randomName,
          password: 'Portal123!',
          role: 'USER',
        },
        {
          headers: { authorization: 'Basic YWRtaW46YWRtaW4=' },
        },
      );
      expect(createUserResponse.status).to.equal(201);
      const generateUserTokenResponse = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username: randomName,
          password: 'Portal123!',
        },
      );
      expect(generateUserTokenResponse.status).to.equal(200);

      const userAuthToken = generateUserTokenResponse.headers['authorization'];

      // Create an account

      const createAccountResponse = await axios.post(
        `${baseUrl}/accounts`,
        {},
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(createAccountResponse.status).to.equal(201);

      const accountId = createAccountResponse.data['id'];
      const accountNumber = createAccountResponse.data['accountNumber'];
      // Deposit

      const depositResponse = await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: accountId,
          balance: amount,
        },
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(depositResponse.status).equals(200);
      expect(depositResponse.data['balance']).equal(amount);
      expect(depositResponse.data['id']).equal(accountId);
      expect(depositResponse.data['accountNumber']).equal(accountNumber);
      expect(depositResponse.data['transactions'][0].amount).equal(amount);
      expect(depositResponse.data['transactions'][0].relatedAccountId).equal(
        accountId,
      );
      expect(depositResponse.data['transactions'][0].type).equal('DEPOSIT');
      // verify account information
      const customerAccountsResponse = await axios.get(
        `${baseUrl}/customer/accounts`,
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(customerAccountsResponse.status).equals(200);
      expect(customerAccountsResponse.data[0].balance).equal(amount);
      expect(customerAccountsResponse.data[0].id).equal(accountId);
      expect(customerAccountsResponse.data[0].accountNumber).equal(
        accountNumber,
      );
      expect(customerAccountsResponse.data[0].transactions[0].amount).equal(
        amount,
      );
      expect(
        customerAccountsResponse.data[0].transactions[0].relatedAccountId,
      ).equal(accountId);
      expect(customerAccountsResponse.data[0].transactions[0].type).equal(
        'DEPOSIT',
      );
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
      const randomName = Math.random().toString(36).substring(2, 12);
      // creating a new user
      const createUserResponse = await axios.post(
        `${baseUrl}/admin/users`,
        {
          username: randomName,
          password: 'Portal123!',
          role: 'USER',
        },
        {
          headers: { authorization: 'Basic YWRtaW46YWRtaW4=' },
        },
      );
      expect(createUserResponse.status).to.equal(201);
      const generateUserTokenResponse = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username: randomName,
          password: 'Portal123!',
        },
      );
      expect(generateUserTokenResponse.status).to.equal(200);

      const userAuthToken = generateUserTokenResponse.headers['authorization'];

      // Create an account

      const createAccountResponse = await axios.post(
        `${baseUrl}/accounts`,
        {},
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(createAccountResponse.status).to.equal(201);

      const accountId = createAccountResponse.data['id'];
      const accountNumber = createAccountResponse.data['accountNumber'];
      // Deposit

      const depositResponse = await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: accountId,
          balance: amount,
        },
        {
          headers: { authorization: userAuthToken },
          validateStatus: () => true,
        },
      );
      expect(depositResponse.status).equals(400);
      expect(depositResponse.data).equal(errorMessage);
      // verify account information
      const customerAccountsResponse = await axios.get(
        `${baseUrl}/customer/accounts`,
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(customerAccountsResponse.status).equals(200);
      expect(customerAccountsResponse.data[0].balance).equal(0);
      expect(customerAccountsResponse.data[0].id).equal(accountId);
    });
  });
  const invalidAccounts = [
    { account: 0, errorMessage: 'Unauthorized access to account' },
    { account: -1, errorMessage: 'Unauthorized access to account' },
  ];
  invalidAccounts.forEach(({ account, errorMessage }) => {
    it(`user cannot deposit correct amount into non owned account "${account}" into his account`, async () => {
      const randomName = Math.random().toString(36).substring(2, 12);
      // creating a new user
      const createUserResponse = await axios.post(
        `${baseUrl}/admin/users`,
        {
          username: randomName,
          password: 'Portal123!',
          role: 'USER',
        },
        {
          headers: { authorization: 'Basic YWRtaW46YWRtaW4=' },
        },
      );
      expect(createUserResponse.status).to.equal(201);
      const generateUserTokenResponse = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username: randomName,
          password: 'Portal123!',
        },
      );
      expect(generateUserTokenResponse.status).to.equal(200);

      const userAuthToken = generateUserTokenResponse.headers['authorization'];

      // Deposit

      const depositResponse = await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: account,
          balance: 100.0,
        },
        {
          headers: { authorization: userAuthToken },
          validateStatus: () => true,
        },
      );
      expect(depositResponse.status).equals(403);
      expect(depositResponse.data).equal(errorMessage);
    });
  });
  it('admin cannot deposit correct amount into customer account', async () => {
    const randomName = Math.random().toString(36).substring(2, 12);
    // creating a new user
    const createUserResponse = await axios.post(
      `${baseUrl}/admin/users`,
      {
        username: randomName,
        password: 'Portal123!',
        role: 'USER',
      },
      {
        headers: { authorization: 'Basic YWRtaW46YWRtaW4=' },
      },
    );
    expect(createUserResponse.status).to.equal(201);
    const generateUserTokenResponse = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: randomName,
        password: 'Portal123!',
      },
    );
    expect(generateUserTokenResponse.status).to.equal(200);

    const userAuthToken = generateUserTokenResponse.headers['authorization'];

    // Create an account

    const createAccountResponse = await axios.post(
      `${baseUrl}/accounts`,
      {},
      {
        headers: { authorization: userAuthToken },
      },
    );
    expect(createAccountResponse.status).to.equal(201);

    const accountId = createAccountResponse.data['id'];
    const accountNumber = createAccountResponse.data['accountNumber'];

    // deposit
    const depositResponse = await axios.post(
      `${baseUrl}/accounts/deposit`,
      {
        id: accountId,
        balance: 100.0,
      },
      {
        headers: { authorization: 'Basic YWRtaW46YWRtaW4=' },
        validateStatus: () => true,
      },
    );
    expect(depositResponse.status).equals(403);
    // verify account information
    const customerAccountsResponse = await axios.get(
      `${baseUrl}/customer/accounts`,
      {
        headers: { authorization: userAuthToken },
      },
    );
    expect(customerAccountsResponse.status).equals(200);
    expect(customerAccountsResponse.data[0].balance).equal(0);
    expect(customerAccountsResponse.data[0].id).equal(accountId);
  });
});
