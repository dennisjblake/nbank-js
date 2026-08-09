import { HttpStatusCode } from 'axios';
import { expect } from 'chai';
import AdminCreateUserRequest from '../../requests/adminCreateUserRequest.js';
import GenerateTokenRequest from '../../requests/generateTokenRequest.js';
import ROLE from '../../utils/roles.js';

describe('Auth Service Tests', function () {
  this.timeout(5000);
  it('should return admin auth token', async () => {
    const response = await new GenerateTokenRequest().login({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    });

    expect(response.headers.Authorization).to.equal(
      `Basic ${process.env.ADMIN_AUTH_TOKEN}`,
    );
    expect(response.status).to.equal(HttpStatusCode.Ok);
  });

  it('user should be able to login', async () => {
    const user = await new AdminCreateUserRequest().createUser(ROLE.USER);

    expect(user.status).to.equal(HttpStatusCode.Created);
    const loginUser = await new GenerateTokenRequest().login({
      username: user.response.username,
      password: user.response.password,
    });

    expect(loginUser.status).to.equal(HttpStatusCode.Ok);
  });
});
