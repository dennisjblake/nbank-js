import axios from "axios";
import { expect } from "chai";

const baseUrl = "http://localhost:4111/api/v1";

describe("API Create User Tests", function () {
  it("admin should be able to create a new user", async function () {
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
  });

  const invalidData = [
    {
      username: "",
      password: "password123!",
      role: "USER",
      errorKey: "username",
      errorMessage: "Username cannot be blank",
    },
    {
      username: "ab",
      password: "password123!",
      role: "USER",
      errorKey: "username",
      errorMessage: "Username must be between 3 and 15 characters",
    },
    {
      username: "abc$",
      password: "password123!",
      role: "USER",
      errorKey: "username",
      errorMessage:
        "Username must contain only letters, digits, dashes, underscores, and dots",
    },
    {
      username: "abc%",
      password: "password123!",
      role: "USER",
      errorKey: "username",
      errorMessage:
        "Username must contain only letters, digits, dashes, underscores, and dots",
    },
  ];
  invalidData.forEach(
    ({ username, password, role, errorKey, errorMessage }) => {
      it(`admin should not be able to create a new user with invalid username: '${username}'`, async function () {
        await axios.post(
          `${baseUrl}/admin/users`,
          {
            username: username,
            password: password,
            role: role,
          },
          {
            headers: { Authorization: "Basic YWRtaW46YWRtaW4=" },
            validateStatus: () => true,
          },
        );
        expect(response.status).to.equal(400);
        expect(response.data[errorKey]).to.contain(errorMessage);
      });
    },
  );
});
