import axios from "axios";
import { expect } from "chai";

const baseUrl = "http://localhost:4111/api/v1";

describe("API Login Tests", function () {
  it("admin should be able to generate a token", async function () {
    const generateTokenResponse = await axios.post(`${baseUrl}/auth/login`, {
      username: "admin",
      password: "admin",
    });
    expect(generateTokenResponse.status).to.equal(200);
    expect(generateTokenResponse.headers["authorization"]).to.equal(
      "Basic YWRtaW46YWRtaW4=",
    );
  });

  it("user should be able to generate a token", async function () {
    const randomName = Math.random().toString(36).substring(2, 12);
    const createUserResponse = await axios.post(
      `${baseUrl}/admin/users`,
      {
        username: randomName,
        password: "Portal123!",
        role: "USER",
      },
      {
        headers: { Authorization: "Basic YWRtaW46YWRtaW4=" },
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
    expect(generateUserTokenResponse.headers["authorization"]).to.exist;
  });
});
