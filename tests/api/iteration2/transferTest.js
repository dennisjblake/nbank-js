import axios from "axios";
import { expect } from "chai";

const baseUrl = "http://localhost:4111/api/v1";

describe("API Transfer Tests", () => {
  const validAmounts = [
    { amount: 0.01 },
    { amount: 0.1 },
    { amount: 1 },
    { amount: 9999.99 },
    { amount: 9999 },
  ];

  validAmounts.forEach(({ amount }) => {
    it(`user can transfer correct amount ${amount} from his account into his account`, async () => {
      const randomName = Math.random().toString(36).substring(2, 12);
      const createUserResponse = await axios.post(
        `${baseUrl}/admin/users`,
        {
          username: randomName,
          password: "Portal123!",
          role: "USER",
        },
        {
          headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
        },
      );
      expect(createUserResponse.status).to.equal(201);
      const generateUserTokenResponse = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username: randomName,
          password: "Portal123!",
        },
      );
      expect(generateUserTokenResponse.status).to.equal(200);

      const userAuthToken = generateUserTokenResponse.headers["authorization"];
      // account 1, 2 creating
      const createAccount1Response = await axios.post(
        `${baseUrl}/accounts`,
        {},
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(createAccount1Response.status).to.equal(201);

      const createAccount2Response = await axios.post(
        `${baseUrl}/accounts`,
        {},
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(createAccount2Response.status).to.equal(201);

      // deposit money 2 times to account 1

      await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: createAccount1Response.data["id"],
          balance: 5000.0,
        },
        {
          headers: { authorization: userAuthToken },
        },
      );
      const depositResponse = await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: createAccount1Response.data["id"],
          balance: 5000.0,
        },
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(depositResponse.status).equals(200);
      expect(depositResponse.data["balance"]).equal(10000.0);
      expect(depositResponse.data["id"]).equal(
        createAccount1Response.data["id"],
      );
      expect(depositResponse.data["accountNumber"]).equal(
        createAccount1Response.data["accountNumber"],
      );

      // transfer money
      const transferResponse = await axios.post(
        `${baseUrl}/accounts/transfer`,
        {
          senderAccountId: createAccount1Response.data["id"],
          receiverAccountId: createAccount2Response.data["id"],
          amount: amount,
        },
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(transferResponse.status).equal(200);
      expect(transferResponse.data["senderAccountId"]).equal(
        createAccount1Response.data["id"],
      );
      expect(transferResponse.data["receiverAccountId"]).equal(
        createAccount2Response.data["id"],
      );
      expect(transferResponse.data["amount"]).equal(amount);
      expect(transferResponse.data["message"]).equal("Transfer successful");

      // verify account information
      const customerAccountsResponse = await axios.get(
        `${baseUrl}/customer/accounts`,
        { headers: { authorization: userAuthToken } },
      );
      const account1 = customerAccountsResponse.data.find(
        (a) => a.id === createAccount1Response.data.id,
      );

      const account2 = customerAccountsResponse.data.find(
        (a) => a.id === createAccount2Response.data.id,
      );

      expect(account1).to.exist;
      expect(account2).to.exist;

      expect(account1.id).to.equal(createAccount1Response.data.id);
      expect(account1.accountNumber).to.equal(
        createAccount1Response.data.accountNumber,
      );
      expect(account1.balance).to.be.closeTo(10000 - amount, 0.0001);

      expect(account2.id).to.equal(createAccount2Response.data.id);
      expect(account2.accountNumber).to.equal(
        createAccount2Response.data.accountNumber,
      );
      expect(account2.balance).to.be.closeTo(amount, 0.0001);
    });
  });

  validAmounts.forEach(({ amount }) => {
    it(`user can transfer correct amount ${amount} from his account into other customer account`, async () => {
      const randomName1 = Math.random().toString(36).substring(2, 12);
      const randomName2 = Math.random().toString(36).substring(2, 12);
      // create user 1
      const createUser1Response = await axios.post(
        `${baseUrl}/admin/users`,
        {
          username: randomName1,
          password: "Portal123!",
          role: "USER",
        },
        {
          headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
        },
      );
      expect(createUser1Response.status).to.equal(201);
      const generateUser1TokenResponse = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username: randomName1,
          password: "Portal123!",
        },
      );
      expect(generateUser1TokenResponse.status).to.equal(200);

      const user1AuthToken =
        generateUser1TokenResponse.headers["authorization"];
      // create account 1 for user 1
      const createAccount1Response = await axios.post(
        `${baseUrl}/accounts`,
        {},
        {
          headers: { authorization: user1AuthToken },
        },
      );
      expect(createAccount1Response.status).to.equal(201);

      // create user 2
      const createUser2Response = await axios.post(
        `${baseUrl}/admin/users`,
        {
          username: randomName2,
          password: "Portal123!",
          role: "USER",
        },
        {
          headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
        },
      );
      expect(createUser2Response.status).to.equal(201);
      const generateUser2TokenResponse = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username: randomName2,
          password: "Portal123!",
        },
      );
      expect(generateUser2TokenResponse.status).to.equal(200);

      const user2AuthToken =
        generateUser2TokenResponse.headers["authorization"];
      // create account 1 for user 2
      const createAccount2Response = await axios.post(
        `${baseUrl}/accounts`,
        {},
        {
          headers: { authorization: user2AuthToken },
        },
      );
      expect(createAccount2Response.status).to.equal(201);

      // deposit money 2 times to account 1 user 1

      await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: createAccount1Response.data["id"],
          balance: 5000.0,
        },
        {
          headers: { authorization: user1AuthToken },
        },
      );
      const depositResponse = await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: createAccount1Response.data["id"],
          balance: 5000.0,
        },
        {
          headers: { authorization: user1AuthToken },
        },
      );
      expect(depositResponse.status).equals(200);
      expect(depositResponse.data["balance"]).equal(10000.0);
      expect(depositResponse.data["id"]).equal(
        createAccount1Response.data["id"],
      );
      expect(depositResponse.data["accountNumber"]).equal(
        createAccount1Response.data["accountNumber"],
      );

      // transfer money
      const transferResponse = await axios.post(
        `${baseUrl}/accounts/transfer`,
        {
          senderAccountId: createAccount1Response.data["id"],
          receiverAccountId: createAccount2Response.data["id"],
          amount: amount,
        },
        {
          headers: { authorization: user1AuthToken },
        },
      );
      expect(transferResponse.status).equal(200);
      expect(transferResponse.data["senderAccountId"]).equal(
        createAccount1Response.data["id"],
      );
      expect(transferResponse.data["receiverAccountId"]).equal(
        createAccount2Response.data["id"],
      );
      expect(transferResponse.data["amount"]).equal(amount);
      expect(transferResponse.data["message"]).equal("Transfer successful");

      // verify account1 user1 information
      const customer1AccountsResponse = await axios.get(
        `${baseUrl}/customer/accounts`,
        { headers: { authorization: user1AuthToken } },
      );
      const account1 = customer1AccountsResponse.data.find(
        (a) => a.id === createAccount1Response.data.id,
      );
      expect(account1).to.exist;
      expect(account1.id).to.equal(createAccount1Response.data.id);
      expect(account1.accountNumber).to.equal(
        createAccount1Response.data.accountNumber,
      );
      expect(account1.balance).to.be.closeTo(10000 - amount, 0.0001);

      // verify account1 user2 information
      const customer2AccountsResponse = await axios.get(
        `${baseUrl}/customer/accounts`,
        { headers: { authorization: user2AuthToken } },
      );
      const account2 = customer2AccountsResponse.data.find(
        (a) => a.id === createAccount2Response.data.id,
      );
      expect(account2).to.exist;
      expect(account2.id).to.equal(createAccount2Response.data.id);
      expect(account2.accountNumber).to.equal(
        createAccount2Response.data.accountNumber,
      );
      expect(account2.balance).to.be.closeTo(amount, 0.0001);
    });
  });
  const invalidAmounts = [
    { amount: 0, errorMessage: "Transfer amount must be at least 0.01" },
    { amount: -1, errorMessage: "Transfer amount must be at least 0.01" },
    { amount: 10001, errorMessage: "Transfer amount cannot exceed 10000" },
    { amount: 10000.01, errorMessage: "Transfer amount cannot exceed 10000" },
  ];

  invalidAmounts.forEach(({ amount, errorMessage }) => {
    it(`user cannot transfer invalid amount ${amount} from his account into his account`, async () => {
      const randomName = Math.random().toString(36).substring(2, 12);
      const createUserResponse = await axios.post(
        `${baseUrl}/admin/users`,
        {
          username: randomName,
          password: "Portal123!",
          role: "USER",
        },
        {
          headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
        },
      );
      expect(createUserResponse.status).to.equal(201);
      const generateUserTokenResponse = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username: randomName,
          password: "Portal123!",
        },
      );
      expect(generateUserTokenResponse.status).to.equal(200);

      const userAuthToken = generateUserTokenResponse.headers["authorization"];
      // account 1, 2 creating
      const createAccount1Response = await axios.post(
        `${baseUrl}/accounts`,
        {},
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(createAccount1Response.status).to.equal(201);

      const createAccount2Response = await axios.post(
        `${baseUrl}/accounts`,
        {},
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(createAccount2Response.status).to.equal(201);

      // deposit money 3 times to account 1

      await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: createAccount1Response.data["id"],
          balance: 5000.0,
        },
        {
          headers: { authorization: userAuthToken },
        },
      );
      await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: createAccount1Response.data["id"],
          balance: 5000.0,
        },
        {
          headers: { authorization: userAuthToken },
        },
      );
      const depositResponse = await axios.post(
        `${baseUrl}/accounts/deposit`,
        {
          id: createAccount1Response.data["id"],
          balance: 5000.0,
        },
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(depositResponse.status).equals(200);
      expect(depositResponse.data["balance"]).equal(15000.0);
      expect(depositResponse.data["id"]).equal(
        createAccount1Response.data["id"],
      );
      expect(depositResponse.data["accountNumber"]).equal(
        createAccount1Response.data["accountNumber"],
      );

      // transfer money
      const transferResponse = await axios.post(
        `${baseUrl}/accounts/transfer`,
        {
          senderAccountId: createAccount1Response.data["id"],
          receiverAccountId: createAccount2Response.data["id"],
          amount: amount,
        },
        {
          headers: { authorization: userAuthToken },
          validateStatus: () => true,
        },
      );
      expect(transferResponse.status).equals(400);
      expect(transferResponse.data).equal(errorMessage);

      // verify account information
      const customerAccountsResponse = await axios.get(
        `${baseUrl}/customer/accounts`,
        { headers: { authorization: userAuthToken } },
      );
      const account1 = customerAccountsResponse.data.find(
        (a) => a.id === createAccount1Response.data.id,
      );

      const account2 = customerAccountsResponse.data.find(
        (a) => a.id === createAccount2Response.data.id,
      );

      expect(account1).to.exist;
      expect(account2).to.exist;

      expect(account1.id).to.equal(createAccount1Response.data.id);
      expect(account1.accountNumber).to.equal(
        createAccount1Response.data.accountNumber,
      );
      expect(account1.balance).to.be.closeTo(15000.0, 0.0001);

      expect(account2.id).to.equal(createAccount2Response.data.id);
      expect(account2.accountNumber).to.equal(
        createAccount2Response.data.accountNumber,
      );
      expect(account2.balance).to.be.closeTo(0, 0.0001);
    });
  });
  it("user cannot transfer with leaving negative balance", async () => {
    const randomName = Math.random().toString(36).substring(2, 12);
    const createUserResponse = await axios.post(
      `${baseUrl}/admin/users`,
      {
        username: randomName,
        password: "Portal123!",
        role: "USER",
      },
      {
        headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
      },
    );
    expect(createUserResponse.status).to.equal(201);
    const generateUserTokenResponse = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: randomName,
        password: "Portal123!",
      },
    );
    expect(generateUserTokenResponse.status).to.equal(200);

    const userAuthToken = generateUserTokenResponse.headers["authorization"];
    // account 1, 2 creating
    const createAccount1Response = await axios.post(
      `${baseUrl}/accounts`,
      {},
      {
        headers: { authorization: userAuthToken },
      },
    );
    expect(createAccount1Response.status).to.equal(201);

    const createAccount2Response = await axios.post(
      `${baseUrl}/accounts`,
      {},
      {
        headers: { authorization: userAuthToken },
      },
    );
    expect(createAccount2Response.status).to.equal(201);
    // transfer money
    const transferResponse = await axios.post(
      `${baseUrl}/accounts/transfer`,
      {
        senderAccountId: createAccount1Response.data["id"],
        receiverAccountId: createAccount2Response.data["id"],
        amount: 100,
      },
      {
        headers: { authorization: userAuthToken },
        validateStatus: () => true,
      },
    );
    expect(transferResponse.status).equals(400);
    expect(transferResponse.data).equal(
      "Invalid transfer: insufficient funds or invalid accounts",
    );

    // verify account information
    const customerAccountsResponse = await axios.get(
      `${baseUrl}/customer/accounts`,
      { headers: { authorization: userAuthToken } },
    );
    const account1 = customerAccountsResponse.data.find(
      (a) => a.id === createAccount1Response.data.id,
    );

    const account2 = customerAccountsResponse.data.find(
      (a) => a.id === createAccount2Response.data.id,
    );

    expect(account1).to.exist;
    expect(account2).to.exist;

    expect(account1.id).to.equal(createAccount1Response.data.id);
    expect(account1.accountNumber).to.equal(
      createAccount1Response.data.accountNumber,
    );
    expect(account1.balance).to.be.closeTo(0.0, 0.0001);

    expect(account2.id).to.equal(createAccount2Response.data.id);
    expect(account2.accountNumber).to.equal(
      createAccount2Response.data.accountNumber,
    );
    expect(account2.balance).to.be.closeTo(0, 0.0001);
  });

  it("user cannot transfer correct amount from another user account into other user account", async () => {
    const randomName1 = Math.random().toString(36).substring(2, 12);
    const randomName2 = Math.random().toString(36).substring(2, 12);
    const randomName3 = Math.random().toString(36).substring(2, 12);
    // create user 1
    const createUser1Response = await axios.post(
      `${baseUrl}/admin/users`,
      {
        username: randomName1,
        password: "Portal123!",
        role: "USER",
      },
      {
        headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
      },
    );
    expect(createUser1Response.status).to.equal(201);
    const generateUser1TokenResponse = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: randomName1,
        password: "Portal123!",
      },
    );
    expect(generateUser1TokenResponse.status).to.equal(200);
    const user1AuthToken = generateUser1TokenResponse.headers["authorization"];

    // create user 2
    const createUser2Response = await axios.post(
      `${baseUrl}/admin/users`,
      {
        username: randomName2,
        password: "Portal123!",
        role: "USER",
      },
      {
        headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
      },
    );
    expect(createUser2Response.status).to.equal(201);
    const generateUser2TokenResponse = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: randomName2,
        password: "Portal123!",
      },
    );
    expect(generateUser2TokenResponse.status).to.equal(200);
    const user2AuthToken = generateUser2TokenResponse.headers["authorization"];

    // create user 3
    const createUser3Response = await axios.post(
      `${baseUrl}/admin/users`,
      {
        username: randomName3,
        password: "Portal123!",
        role: "USER",
      },
      {
        headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
      },
    );
    expect(createUser3Response.status).to.equal(201);
    const generateUser3TokenResponse = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: randomName3,
        password: "Portal123!",
      },
    );
    expect(generateUser3TokenResponse.status).to.equal(200);

    const user3AuthToken = generateUser3TokenResponse.headers["authorization"];

    // create account 1 for user 2
    const createAccount1user2Response = await axios.post(
      `${baseUrl}/accounts`,
      {},
      {
        headers: { authorization: user2AuthToken },
      },
    );
    expect(createAccount1user2Response.status).to.equal(201);

    // create account 1 for user 3
    const createAccount1user3Response = await axios.post(
      `${baseUrl}/accounts`,
      {},
      {
        headers: { authorization: user3AuthToken },
      },
    );
    expect(createAccount1user3Response.status).to.equal(201);

    // deposit money 1 time to account 1 user 2
    const depositResponse = await axios.post(
      `${baseUrl}/accounts/deposit`,
      {
        id: createAccount1user2Response.data["id"],
        balance: 5000.0,
      },
      {
        headers: { authorization: user2AuthToken },
      },
    );
    expect(depositResponse.status).equals(200);
    expect(depositResponse.data["balance"]).equal(5000.0);
    expect(depositResponse.data["id"]).equal(
      createAccount1user2Response.data["id"],
    );
    expect(depositResponse.data["accountNumber"]).equal(
      createAccount1user2Response.data["accountNumber"],
    );

    // transfer money
    const transferResponse = await axios.post(
      `${baseUrl}/accounts/transfer`,
      {
        senderAccountId: createAccount1user2Response.data["id"],
        receiverAccountId: createAccount1user3Response.data["id"],
        amount: 100.0,
      },
      {
        headers: { authorization: user1AuthToken },
        validateStatus: () => true,
      },
    );
    expect(transferResponse.status).equals(403);
    expect(transferResponse.data).equal("Unauthorized access to account");

    // verify account1 user2 information
    const customer2AccountsResponse = await axios.get(
      `${baseUrl}/customer/accounts`,
      { headers: { authorization: user2AuthToken } },
    );
    const account1 = customer2AccountsResponse.data.find(
      (a) => a.id === createAccount1user2Response.data.id,
    );
    expect(account1).to.exist;
    expect(account1.id).to.equal(createAccount1user2Response.data.id);
    expect(account1.accountNumber).to.equal(
      createAccount1user2Response.data.accountNumber,
    );
    expect(account1.balance).to.be.closeTo(5000.0, 0.0001);

    // verify account1 user3 information
    const customer3AccountsResponse = await axios.get(
      `${baseUrl}/customer/accounts`,
      { headers: { authorization: user3AuthToken } },
    );
    const account2 = customer3AccountsResponse.data.find(
      (a) => a.id === createAccount1user3Response.data.id,
    );
    expect(account2).to.exist;
    expect(account2.id).to.equal(createAccount1user3Response.data.id);
    expect(account2.accountNumber).to.equal(
      createAccount1user3Response.data.accountNumber,
    );
    expect(account2.balance).to.be.closeTo(0, 0.0001);
  });
  it("user cannot transfer correct amount from another user account into his own account", async () => {
    const randomName1 = Math.random().toString(36).substring(2, 12);
    const randomName2 = Math.random().toString(36).substring(2, 12);
    // create user 1
    const createUser1Response = await axios.post(
      `${baseUrl}/admin/users`,
      {
        username: randomName1,
        password: "Portal123!",
        role: "USER",
      },
      {
        headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
      },
    );
    expect(createUser1Response.status).to.equal(201);
    const generateUser1TokenResponse = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: randomName1,
        password: "Portal123!",
      },
    );
    expect(generateUser1TokenResponse.status).to.equal(200);

    const user1AuthToken = generateUser1TokenResponse.headers["authorization"];
    // create account 1 for user 1
    const createAccount1Response = await axios.post(
      `${baseUrl}/accounts`,
      {},
      {
        headers: { authorization: user1AuthToken },
      },
    );
    expect(createAccount1Response.status).to.equal(201);

    // create user 2
    const createUser2Response = await axios.post(
      `${baseUrl}/admin/users`,
      {
        username: randomName2,
        password: "Portal123!",
        role: "USER",
      },
      {
        headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
      },
    );
    expect(createUser2Response.status).to.equal(201);
    const generateUser2TokenResponse = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: randomName2,
        password: "Portal123!",
      },
    );
    expect(generateUser2TokenResponse.status).to.equal(200);

    const user2AuthToken = generateUser2TokenResponse.headers["authorization"];
    // create account 1 for user 2
    const createAccount2Response = await axios.post(
      `${baseUrl}/accounts`,
      {},
      {
        headers: { authorization: user2AuthToken },
      },
    );
    expect(createAccount2Response.status).to.equal(201);

    // deposit money 5000 to account 1 user 2
    const depositResponse = await axios.post(
      `${baseUrl}/accounts/deposit`,
      {
        id: createAccount2Response.data["id"],
        balance: 5000.0,
      },
      {
        headers: { authorization: user2AuthToken },
      },
    );
    expect(depositResponse.status).equals(200);
    expect(depositResponse.data["balance"]).equal(5000.0);
    expect(depositResponse.data["id"]).equal(createAccount2Response.data["id"]);
    expect(depositResponse.data["accountNumber"]).equal(
      createAccount2Response.data["accountNumber"],
    );

    // transfer money
    const transferResponse = await axios.post(
      `${baseUrl}/accounts/transfer`,
      {
        senderAccountId: createAccount2Response.data["id"],
        receiverAccountId: createAccount1Response.data["id"],
        amount: 100.0,
      },
      {
        headers: { authorization: user1AuthToken },
        validateStatus: () => true,
      },
    );
    expect(transferResponse.status).equal(403);
    expect(transferResponse.data).equal("Unauthorized access to account");
    // verify account1 user1 information
    const customer1AccountsResponse = await axios.get(
      `${baseUrl}/customer/accounts`,
      { headers: { authorization: user1AuthToken } },
    );
    const account1 = customer1AccountsResponse.data.find(
      (a) => a.id === createAccount1Response.data.id,
    );
    expect(account1).to.exist;
    expect(account1.id).to.equal(createAccount1Response.data.id);
    expect(account1.accountNumber).to.equal(
      createAccount1Response.data.accountNumber,
    );
    expect(account1.balance).to.be.closeTo(0.0, 0.0001);

    // verify account1 user2 information
    const customer2AccountsResponse = await axios.get(
      `${baseUrl}/customer/accounts`,
      { headers: { authorization: user2AuthToken } },
    );
    const account2 = customer2AccountsResponse.data.find(
      (a) => a.id === createAccount2Response.data.id,
    );
    expect(account2).to.exist;
    expect(account2.id).to.equal(createAccount2Response.data.id);
    expect(account2.accountNumber).to.equal(
      createAccount2Response.data.accountNumber,
    );
    expect(account2.balance).to.be.closeTo(5000.0, 0.0001);
  });

  it("user can transfer correct amount from his account to the same account", async () => {
    const randomName = Math.random().toString(36).substring(2, 12);
    const createUserResponse = await axios.post(
      `${baseUrl}/admin/users`,
      {
        username: randomName,
        password: "Portal123!",
        role: "USER",
      },
      {
        headers: { authorization: "Basic YWRtaW46YWRtaW4=" },
      },
    );
    expect(createUserResponse.status).to.equal(201);
    const generateUserTokenResponse = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: randomName,
        password: "Portal123!",
      },
    );
    expect(generateUserTokenResponse.status).to.equal(200);

    const userAuthToken = generateUserTokenResponse.headers["authorization"];
    // account 1 user 1
    const createAccount1Response = await axios.post(
      `${baseUrl}/accounts`,
      {},
      {
        headers: { authorization: userAuthToken },
      },
    );
    expect(createAccount1Response.status).to.equal(201);

    // deposit 5000 to account 1
    const depositResponse = await axios.post(
      `${baseUrl}/accounts/deposit`,
      {
        id: createAccount1Response.data["id"],
        balance: 5000.0,
      },
      {
        headers: { authorization: userAuthToken },
      },
    );
    expect(depositResponse.status).equals(200);
    expect(depositResponse.data["balance"]).equal(5000.0);
    expect(depositResponse.data["id"]).equal(createAccount1Response.data["id"]);
    expect(depositResponse.data["accountNumber"]).equal(
      createAccount1Response.data["accountNumber"],
    );
    // transfer money
    const transferResponse = await axios.post(
      `${baseUrl}/accounts/transfer`,
      {
        senderAccountId: createAccount1Response.data["id"],
        receiverAccountId: createAccount1Response.data["id"],
        amount: 100.0,
      },
      {
        headers: { authorization: userAuthToken },
      },
    );
    expect(transferResponse.status).equal(200);
    expect(transferResponse.data["senderAccountId"]).equal(
      createAccount1Response.data["id"],
    );
    expect(transferResponse.data["receiverAccountId"]).equal(
      createAccount1Response.data["id"],
    );
    expect(transferResponse.data["amount"]).equal(100.0);
    expect(transferResponse.data["message"]).equal("Transfer successful");

    // verify account information
    const customerAccountsResponse = await axios.get(
      `${baseUrl}/customer/accounts`,
      { headers: { authorization: userAuthToken } },
    );
    const account1 = customerAccountsResponse.data.find(
      (a) => a.id === createAccount1Response.data.id,
    );
    expect(account1).to.exist;

    expect(account1.id).to.equal(createAccount1Response.data.id);
    expect(account1.accountNumber).to.equal(
      createAccount1Response.data.accountNumber,
    );
    expect(account1.balance).to.be.closeTo(5000.0, 0.0001);
  });
});
