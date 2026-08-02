import { HttpStatusCode } from 'axios';
import {
  randomAlphabeticString,
  randomInvalidProfileName,
} from '../../../seniorTests/generators/randomData.js';
import { AdminSteps } from '../../../seniorTests/utils/steps/adminSteps.js';
import { UserSteps } from '../../../seniorTests/utils/steps/userSteps.js';
import { expect, test } from '../../fixtures/baseUi.js';
import { BankAlert } from '../../pages/bankAlert.js';
import EditProfile from '../../pages/editProfilePage.js';
import URL from '../../pages/url.js';
import UserDashboard from '../../pages/userDashboard.js';

test.describe('UI Name Change Tests', () => {
  test('user can change name to correct value', async ({
    page,
    authAsUser,
  }) => {
    // Create user and login
    const randomProfileName = randomAlphabeticString();
    const { token } = await AdminSteps.createUserAndLogin();

    await authAsUser({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // change the profile name
    await userDashboard.openProfileHeaderPage();
    const editProfile = new EditProfile(page);
    await editProfile.expectLoaded();
    await editProfile.checkAlertAndAccept(
      BankAlert.NAME_CHANGED_SUCCESSFULLY_ALERT_TEXT,
      () => editProfile.editProfileName(randomProfileName),
    );
    await editProfile.navigateToUserDashboad();
    await userDashboard.expectLoaded();
    await userDashboard.expectWelcomeTextToContain(randomProfileName);

    // check the API result
    const { status: customerProfileStatus, data: customerProfileResponse } =
      await UserSteps.getProfileInfo(token);
    expect(customerProfileStatus).toBe(HttpStatusCode.Ok);
    expect(customerProfileResponse.name).toBe(randomProfileName);
  });
  test('user cannot change name to incorrect value', async ({
    page,
    authAsUser,
  }) => {
    // Create user and login
    const randomProfileName = randomInvalidProfileName();
    const { token } = await AdminSteps.createUserAndLogin();

    await authAsUser({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // change the profile name
    await userDashboard.openProfileHeaderPage();
    const editProfile = new EditProfile(page);
    await editProfile.expectLoaded();
    await editProfile.checkAlertAndAccept(
      BankAlert.NAME_MUST_CONTAIN_TWO_WORDS_ALERT_TEXT,
      () => editProfile.editProfileNameInvalid(randomProfileName),
    );
    await editProfile.navigateToUserDashboad();
    await userDashboard.expectLoaded();
    await userDashboard.expectWelcomeTextToContain('noname');

    // check the API result
    const { status: customerProfileStatus, data: customerProfileResponse } =
      await UserSteps.getProfileInfo(token);
    expect(customerProfileStatus).toBe(HttpStatusCode.Ok);
    expect(customerProfileResponse.name).toBe(null);
  });
  test('user cannot change name to the same value', async ({
    page,
    authAsUser,
  }) => {
    // Create user and login
    const randomProfileName = randomAlphabeticString();
    const { token } = await AdminSteps.createUserAndLogin();

    // Set initial name via API
    const { data, status: profileNameChangeStatus } =
      await UserSteps.changeProfileName(randomProfileName, token);
    expect(profileNameChangeStatus).toBe(HttpStatusCode.Ok);
    expect(data.customer.name).toBe(randomProfileName);

    await authAsUser({ token, goto: URL.DASHBOARD });
    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    // Verify initial name is displayed
    await userDashboard.expectWelcomeTextToContain(randomProfileName);
    await userDashboard.openProfileHeaderPage();
    const editProfile = new EditProfile(page);
    await editProfile.expectLoaded();

    // Verify the field shows current name
    await expect(editProfile.profileNameInputField).toHaveValue(
      randomProfileName,
    );

    // Fill with the same value
    await editProfile.checkAlertAndAccept(
      BankAlert.NEW_NAME_THE_SAME_ALERT_TEXT,
      () => editProfile.editProfileNameInvalid(randomProfileName),
    );
    await editProfile.navigateToUserDashboad();
    await userDashboard.expectLoaded();
    await userDashboard.expectWelcomeTextToContain(randomProfileName);

    // check the API result
    const { status: customerProfileStatus, data: customerProfileResponse } =
      await UserSteps.getProfileInfo(token);
    expect(customerProfileStatus).toBe(HttpStatusCode.Ok);
    expect(customerProfileResponse.name).toBe(randomProfileName);
  });
});
