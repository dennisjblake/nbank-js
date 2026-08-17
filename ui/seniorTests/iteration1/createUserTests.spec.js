import RandExp from 'randexp';
import { generateUser } from '../../../seniorTests/generators/generateRandomUserData.js';
import { assertThatModels } from '../../../seniorTests/models/comparison/modelAssertions.js';
import CreateUserRequest from '../../../seniorTests/models/createUserRequest.js';
import { AdminSteps } from '../../../seniorTests/utils/steps/adminSteps.js';
import { expect, test } from '../../fixtures/adminSession.js';
import AdminPanel from '../../pages/adminPanelPage.js';
import { BankAlert } from '../../pages/bankAlert.js';
import URL from '../../pages/url.js';

test.describe('Auth Service Tests', () => {
  test('admin should be able to create a new user with correct data', async ({
    page,
    authAsAdmin,
  }) => {
    await authAsAdmin({ goto: URL.ADMIN });
    const adminPanel = new AdminPanel(page);
    await adminPanel.expectAdminPanelVisible();

    const newUser = generateUser();
    await adminPanel.checkAlertAndAccept(
      BankAlert.SUCCESSFULL_USER_CREATION_ALERT_TEXT,
      () => adminPanel.createUser(newUser.username, newUser.password),
    );
    await adminPanel.expectUserVisible(newUser.username);
    const { responseData: users } = await AdminSteps.getAllUsers();
    const createdUser = users.find((u) => u.username === newUser.username);
    expect(createdUser, 'User must exist in backend list').toBeTruthy();
    const expected = new CreateUserRequest(newUser);

    await assertThatModels(expected, createdUser).match();
  });

  test('admin should not be able to create a new user with invalid data', async ({
    page,
    authAsAdmin,
  }) => {
    await authAsAdmin({ goto: URL.ADMIN });
    const adminPanel = new AdminPanel(page);
    await adminPanel.expectAdminPanelVisible();
    const newUser = generateUser();
    newUser.username = new RandExp(/([A-Za-z0-9]{1,2}|[A-Za-z0-9]{16,})/).gen();
    await adminPanel.checkAlertAndAccept(
      BankAlert.USERNAME_MUST_BE_BETWEEN_3_AND_15_CHARACTERS,
      () => adminPanel.createUser(newUser.username, newUser.password),
    );

    await adminPanel.expectUserNotExists(newUser.username);
    const { responseData: users } = await AdminSteps.getAllUsers();
    const sameNameCount = users.filter(
      (u) => u.username === newUser.username,
    ).length;
    expect(sameNameCount).toBe(0);
  });
});
