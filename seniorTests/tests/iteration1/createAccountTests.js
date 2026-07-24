import { expect } from 'chai';
import HTTP_STATUS from '../../utils/httpStatus.js';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { UserSteps } from '../../utils/steps/userSteps.js';

describe('Accounts Service Tests', function () {
  it('user should be able to create an account', async function () {
    const { token } = await AdminSteps.createUserAndLogin();

    // Account creation
    const { responseData: accountCreateData, status: accountCreateStatus } =
      await UserSteps.createAccount(token);

    expect(accountCreateStatus).to.equal(HTTP_STATUS.CREATED);
    expect(accountCreateData.accountNumber).to.exist;
  });
});
