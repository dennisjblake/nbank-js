import { HttpStatusCode } from 'axios';
import { expect } from 'chai';
import AdminCreateUserRequest from '../../requests/adminCreateUserRequest.js';
import CreateAccountRequest from '../../requests/createAccountRequest.js';
import GenerateTokenRequest from '../../requests/generateTokenRequest.js';

describe('Account Service Tests', function () {
  it('user should be able to create an account', async () => {
    const user = await new AdminCreateUserRequest().createUser('USER');
    const loginRequest = await new GenerateTokenRequest().login({
      username: user.response.username,
      password: user.response.password,
    });

    const authToken = loginRequest.headers.Authorization;
    const { status, responseData } =
      await new CreateAccountRequest().createAccount(authToken);

    expect(status).to.equal(HttpStatusCode.Created);
    expect(responseData.accountNumber).to.be.a('string').and.not.empty;
  });
});
