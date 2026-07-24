import { expect } from 'chai';
import dotenv from 'dotenv';
import HTTP_STATUS from '../../utils/httpStatus.js';
import Requester from '../../utils/requester.js';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { UserSteps } from '../../utils/steps/userSteps.js';

dotenv.config();

describe('Auth Service Tests', function () {
  it('user should be able to login after creation', async function () {
    const { requestData } = await AdminSteps.createUser();
    const { status: loginStatus, token } = await UserSteps.login(requestData);
    expect(loginStatus).to.equal(HTTP_STATUS.OK);
    expect(token).to.exist;
  });
  it('admin should be able to login with correct credentials', async function () {
    const requester = new Requester();
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    const { status: loginStatus, token: loginToken } =
      await UserSteps.loginWithCreds(username, password);

    expect(loginStatus).to.equal(HTTP_STATUS.OK);
    expect(loginToken).to.equal(`Basic ${process.env.ADMIN_AUTH_TOKEN}`);
  });
});
