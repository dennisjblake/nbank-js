import { HttpStatusCode } from 'axios';
import RandExp from 'randexp';
import { generateUser } from '../../../seniorTests/generators/generateRandomUserData.js';
import { assertThatModels } from '../../../seniorTests/models/comparison/modelAssertions.js';
import CreateUserRequest from '../../../seniorTests/models/createUserRequest.js';
import { AdminSteps } from '../../../seniorTests/utils/steps/adminSteps.js';
import { expect, test } from '../../fixtures/baseUi.js';
import AdminPanel from '../../pages/adminPanelPage.js';
import { BankAlert } from '../../pages/bankAlert.js';
import URL from '../../pages/url.js';
import ROLE from '../../../seniorTests/utils/roles';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const INVALID_USERNAME_RE = /([A-Za-z0-9]{1,2}|[A-Za-z0-9]{16,})/;

test.describe('Auth Service Tests', () => {
  test('admin should be able to create a new use with correct data', async ({
    page,
    authAsUserWithCreds,
  }) => {
    await authAsUserWithCreds({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      goto: URL.ADMIN,
    });
    const adminPanel = new AdminPanel(page);
    await adminPanel.expectAdminPanelVisible();

    const newUser = generateUser();

    await adminPanel.checkAlertAndAccept(
      BankAlert.SUCCESSFULL_USER_CREATION_ALERT_TEXT,
      () => adminPanel.createUser(newUser.username, newUser.password),
    );

    const listOfUsers = adminPanel.allUsers();
    const userRow = listOfUsers.filter({
      hasText: newUser.username,
    });
    await expect(userRow).toHaveCount(1);
    await userRow.first().scrollIntoViewIfNeeded();

    await expect(
      userRow.first().getByText(ROLE.USER, { exact: true }),
    ).toBeVisible();

    const { status, responseData } = await AdminSteps.getAllUsers();
    expect(status).toBe(HttpStatusCode.Ok);
    const createdUser = responseData.find(
      (u) => u.username === newUser.username,
    );
    expect(createdUser, 'Created user must exists in backend').toBeTruthy();

    const expected = new CreateUserRequest(newUser);
    await assertThatModels(expected, createdUser).match();
  });

  test('admin should not be able to create a new user with invalid data', async ({
    page,
    authAsUserWithCreds,
  }) => {
    await authAsUserWithCreds({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      goto: URL.ADMIN,
    });
    const adminPanel = new AdminPanel(page);
    await adminPanel.expectAdminPanelVisible();

    const newUser = generateUser();
    newUser.username = new RandExp(INVALID_USERNAME_RE).gen();

    await adminPanel.checkAlertAndAccept(
      BankAlert.USERNAME_MUST_BE_BETWEEN_3_AND_15_CHARACTERS,
      () => adminPanel.createUser(newUser.username, newUser.password),
    );

    await adminPanel.expectUserNotExists(newUser.username);
    const { status, responseData } = await AdminSteps.getAllUsers();
    expect(status).toBe(HttpStatusCode.Ok);
    const notCreatedUser = responseData.find(
      (u) => u.username === newUser.username,
    );
    expect(notCreatedUser).toBeUndefined();
  });
});
