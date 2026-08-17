import {
  randomAlphabeticString,
  randomInvalidProfileName,
} from '../../../seniorTests/generators/randomData.js';
import { expect, test } from '../../fixtures/baseUi.js';
import { BankAlert } from '../../pages/bankAlert.js';
import BANK_STRINGS from '../../pages/bankStrings.js';
import EditProfile from '../../pages/editProfilePage.js';
import URL from '../../pages/url.js';
import UserDashboard from '../../pages/userDashboard.js';

test.describe('UI Name Change Tests', () => {
  test('user can change name to correct value', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    // Create user and login
    const randomProfileName = randomAlphabeticString();

    const [session] = await withUserSession(1);
    const { steps, token } = session;

    await authWithToken({ token, goto: URL.DASHBOARD });

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
    const { data: customerProfileResponse } = await steps.getProfileInfo();
    expect(customerProfileResponse.name).toBe(randomProfileName);
  });
  test('user cannot change name to incorrect value', async ({
    page,
    authWithToken,
    withUserSession,
  }) => {
    // Create user and login
    const randomProfileName = randomInvalidProfileName();
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    await authWithToken({ token, goto: URL.DASHBOARD });

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
    await userDashboard.expectWelcomeTextToContain(BANK_STRINGS.NONAME);

    // check the API result
    const { data: customerProfileResponse } = await steps.getProfileInfo();
    expect(customerProfileResponse.name).toBeNull();
  });
  test('user cannot change name to the same value', async ({
    page,
    authWithToken,
    withUserSession,
  }) => {
    // Create user and login
    const randomProfileName = randomAlphabeticString();
    const [session] = await withUserSession(1);
    const { steps, token } = session;

    // Set initial name via API
    await steps.changeProfileName(randomProfileName);

    await authWithToken({ token, goto: URL.DASHBOARD });

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
    const { data: customerProfileResponse } = await steps.getProfileInfo();
    expect(customerProfileResponse.name).toBe(randomProfileName);
  });
});
