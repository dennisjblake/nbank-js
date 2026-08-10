import { expect } from 'chai';
import dotenv from 'dotenv';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { UserSteps } from '../../utils/steps/userSteps.js';

dotenv.config({ quiet: true });

describe('Auth Service Tests', function () {
  it('user should be able to login after creation', async function () {
    const { token } = await AdminSteps.createUserAndLogin();
    expect(token).to.exist;
  });
  it('admin should be able to login with correct credentials', async function () {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    const { token: loginToken } = await UserSteps.loginWithCreds(
      username,
      password,
    );

    expect(loginToken).to.equal(`Basic ${process.env.ADMIN_AUTH_TOKEN}`);
  });
});
