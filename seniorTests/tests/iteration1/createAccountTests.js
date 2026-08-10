import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { UserSteps } from '../../utils/steps/userSteps.js';

describe('Accounts Service Tests', function () {
  it('user should be able to create an account', async function () {
    const { token } = await AdminSteps.createUserAndLogin();
    const stepsUser1 = new UserSteps({ token });

    // Account creation
    await stepsUser1.createAccount();
  });
});
