import axios from "axios";
import { expect } from "chai";

const baseUrl = "http://localhost:4111/api/v1";

describe("API Account Test", function () {
  it("user should be able to create an account", async function () {
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

    const createAccountResponse = await axios.post(
      `${baseUrl}/accounts`,
      {},
      {
        headers: { authorization: userAuthToken },
      },
    );
    expect(createAccountResponse.status).to.equal(201);
  });
});
