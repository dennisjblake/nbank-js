import { expect } from 'chai';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import LoginUserRequest from '../../models/loginUserRequest.js';
import Requester from '../../utils/requester.js';
import { ENDPOINT_KEY } from '../../utils/endpoints.js';
import HTTP_STATUS from '../../utils/httpStatus.js';
import ApiConfig from '../../utils/apiConfig.js';
import { UserSteps } from '../../utils/steps/userSteps.js';

describe('Accounts Service Tests', function () {
  it('user should be able to create an account', async function () {
    const { requestData } = await AdminSteps.createUser();

    const username = requestData.username;
    const password = requestData.password;

    const requester = new Requester();

    const { status: loginStatus, token: loginToken } = await UserSteps.login({
      username,
      password,
    });

    const token = loginToken;
    expect(loginStatus).to.equal(HTTP_STATUS.OK);

    // Account creation
    const { responseData: accountCreateData, status: accountCreateStatus } =
      await UserSteps.createAccount(token);

    expect(accountCreateStatus).to.equal(HTTP_STATUS.CREATED);
    expect(accountCreateData.accountNumber).to.exist;
  });
});
