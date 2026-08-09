import { HttpStatusCode } from 'axios';
import { expect, test } from 'playwright/test';
import { AdminSteps } from '../../../seniorTests/utils/steps/adminSteps.js';
import AdminPanel from '../../pages/adminPanelPage.js';
import LoginPage from '../../pages/loginPage.js';
import UserDashboard from '../../pages/userDashboard.js';
import BANK_STRINGS from '../../pages/bankStrings.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe('Login Service Tests', () => {
  test('admin should be able to login with correct credentials', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);

    const adminPanel = new AdminPanel(page);
    await adminPanel.expectAdminPanelVisible();
  });

  test('user should be able to login with correct credentials', async ({
    page,
  }) => {
    const { requestData, status } = await AdminSteps.createUser();
    expect(status).toBe(HttpStatusCode.Created);
    const { username, password } = requestData;

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(username, password);

    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();
    await userDashboard.expectWelcomeTextToContain(BANK_STRINGS.NONAME);
  });
});
