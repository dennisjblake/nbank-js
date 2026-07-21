import GenerateTokenRequest from '../../requests/generateTokenRequest.js';
import AdminCreateUserRequest from '../../requests/adminCreateUserRequest.js';
import { expect } from 'chai';

describe('Auth Service Tests', function () {
  this.timeout(5000);
  it('should return admin auth token', async () => {
    const response = await new GenerateTokenRequest().login({
      username: 'admin',
      password: 'admin',
    });

    expect(response.headers.Authorization).to.equal(
      process.env.ADMIN_AUTH_TOKEN,
    );
    expect(response.status).to.equal(200);
  });

  it('user should be able to login', async () => {
    const user = await new AdminCreateUserRequest().createUser('USER');

    expect(user.status).to.equal(201);
    const loginUser = await new GenerateTokenRequest().login({
      username: user.response.username,
      password: user.response.password,
    });

    expect(loginUser.status).to.equal(200);
  });
});
