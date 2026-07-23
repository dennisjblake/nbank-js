import { expect } from 'chai';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import LoginUserRequest from '../../models/loginUserRequest.js';
import Requester from '../../utils/requester.js';
import { ENDPOINT_KEY } from '../../utils/endpoints.js';
import HTTP_STATUS from '../../utils/httpStatus.js';
import dotenv from 'dotenv';
import { UserSteps } from '../../utils/steps/userSteps.js';

dotenv.config();

describe('Auth Service Tests', function () {
  it('user should be able to login after creation', async function () {
    const { requestData } = await AdminSteps.createUser();

    const username = requestData.username;
    const password = requestData.password;

    const requester = new Requester();

    const { data, status, headers } = await requester.request(
      ENDPOINT_KEY.LOGIN,
      { data: new LoginUserRequest({ username, password }) },
    );

    expect(status).to.equal(HTTP_STATUS.OK);
    expect(data.username).to.equal(username);
    expect(headers.authorization).to.exist;
  });
  it('admin should be able to login with correct credentials', async function () {
    const requester = new Requester();
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    const { status: loginStatus, token: loginToken } = await UserSteps.login({
      username,
      password,
    });

    expect(loginStatus).to.equal(HTTP_STATUS.OK);
    expect(loginToken).to.equal(`Basic ${process.env.ADMIN_AUTH_TOKEN}`);
  });
});
