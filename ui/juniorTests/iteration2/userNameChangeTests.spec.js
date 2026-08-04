import { HttpStatusCode } from 'axios';
import { expect, test } from 'playwright/test';
import {
  randomAlphabeticString,
  randomInvalidProfileName,
} from '../../../seniorTests/generators/randomData.js';
import { AdminSteps } from '../../../seniorTests/utils/steps/adminSteps.js';
import { UserSteps } from '../../../seniorTests/utils/steps/userSteps.js';
import BANK_STRINGS from '../../pages/bankStrings.js';

test.describe('UI Name Change Tests', () => {
  test('user can change name to correct value', async ({ page }) => {
    // Create user and login
    const randomProfileName = randomAlphabeticString();
    const { requestData, token, status } =
      await AdminSteps.createUserAndLogin();
    expect(status).toBe(HttpStatusCode.Ok);
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      token,
    );
    await page.goto('/dashboard');

    // change the profile name
    const getProfileResponses = [
      page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [200].includes(response.status()),
      ),
      page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [200].includes(response.status()),
      ),
    ];
    await page.locator('.profile-header').click();
    await Promise.all(getProfileResponses);
    await expect(page).toHaveURL('/edit-profile');
    const pageTitleText = page.getByRole('heading', {
      name: '✏️ Edit Profile',
    });
    await expect(pageTitleText).toBeVisible;
    await expect(pageTitleText).toHaveText('✏️ Edit Profile');
    const profileNameInputField = page.getByRole('textbox', {
      name: 'Enter new name',
    });
    await profileNameInputField.fill(randomProfileName);
    await expect(profileNameInputField).toHaveValue(randomProfileName);
    const putProfilePromise = page.waitForResponse(
      (response) =>
        response.url().includes('profile') &&
        response.request().method() === 'PUT' &&
        [200].includes(response.status()),
    );
    const getProfilePromise = page.waitForResponse(
      (response) =>
        response.url().includes('profile') &&
        response.request().method() === 'GET' &&
        [200].includes(response.status()),
    );

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain('✅ Name updated successfully!');
      await dialog.accept();
    });

    await page.getByRole('button', { name: '💾 Save Changes' }).click();

    await Promise.all([putProfilePromise, getProfilePromise]);
    await page.getByRole('button', { name: '🏠 Home' }).click();
    await expect(page).toHaveURL('/dashboard');
    const welcome = page.locator('.welcome-text');
    await expect(welcome).toBeVisible();
    await expect(welcome).toHaveText(`Welcome, ${randomProfileName}!`);

    // check the API result
    const { status: customerProfileStatus, data: customerProfileResponse } =
      await UserSteps.getProfileInfo(token);

    expect(customerProfileStatus).toBe(HttpStatusCode.Ok);
    expect(customerProfileResponse.name).toBe(randomProfileName);
  });
  test('user cannot change name to incorrect value', async ({ page }) => {
    // Create user and login
    const randomProfileName = randomInvalidProfileName();
    const { requestData, token, status } =
      await AdminSteps.createUserAndLogin();
    expect(status).toBe(HttpStatusCode.Ok);
    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      token,
    );
    await page.goto('/dashboard');

    // change the profile name
    const getProfileResponses = [
      page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [200].includes(response.status()),
      ),
      page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [200].includes(response.status()),
      ),
    ];
    await page.locator('.profile-header').click();
    await Promise.all(getProfileResponses);
    await expect(page).toHaveURL('/edit-profile');
    const pageTitleText = page.getByRole('heading', {
      name: '✏️ Edit Profile',
    });
    await expect(pageTitleText).toBeVisible;
    await expect(pageTitleText).toHaveText('✏️ Edit Profile');
    const profileNameInputField = page.getByRole('textbox', {
      name: 'Enter new name',
    });
    await profileNameInputField.fill(randomProfileName);
    await expect(profileNameInputField).toHaveValue(randomProfileName);

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain(
        'Name must contain two words with letters only',
      );
      await dialog.accept();
    });

    await page.getByRole('button', { name: '💾 Save Changes' }).click();
    await page.getByRole('button', { name: '🏠 Home' }).click();
    await expect(page).toHaveURL('/dashboard');
    const welcome = page.locator('.welcome-text');
    await expect(welcome).toBeVisible();
    await expect(welcome).toHaveText(
      `Welcome, ${BANK_STRINGS.DEFAULT_NONAME}!`,
    );

    // check the API result
    const { status: customerProfileStatus, data: customerProfileResponse } =
      await UserSteps.getProfileInfo(token);

    expect(customerProfileStatus).toBe(HttpStatusCode.Ok);
    expect(customerProfileResponse.name).toBe(null);
  });
  test('user cannot change name to the same value', async ({ page }) => {
    // Create user and login
    const randomProfileName = randomAlphabeticString();
    const { token, status: createUserStatus } =
      await AdminSteps.createUserAndLogin();
    expect(createUserStatus).toBe(HttpStatusCode.Ok);

    // Set initial name via API
    const { data, status: profileNameChangeStatus } =
      await UserSteps.changeProfileName(randomProfileName, token);
    expect(profileNameChangeStatus).toBe(HttpStatusCode.Ok);
    expect(data.customer.name).toBe(randomProfileName);

    await page.addInitScript(
      (token) => window.localStorage.setItem('authToken', token),
      token,
    );
    await page.goto('/dashboard');

    // Verify initial name is displayed
    const welcomeInitial = page.locator('.welcome-text');
    await expect(welcomeInitial).toBeVisible();
    await expect(welcomeInitial).toHaveText(`Welcome, ${randomProfileName}!`);

    // Try to change the profile name to the same value
    const getProfileResponses = [
      page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [200].includes(response.status()),
      ),
      page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [200].includes(response.status()),
      ),
    ];
    await page.locator('.profile-header').click();
    await Promise.all(getProfileResponses);
    await expect(page).toHaveURL('/edit-profile');
    const pageTitleText = page.getByRole('heading', {
      name: '✏️ Edit Profile',
    });
    await expect(pageTitleText).toBeVisible;
    await expect(pageTitleText).toHaveText('✏️ Edit Profile');

    const profileNameInputField = page.getByRole('textbox', {
      name: 'Enter new name',
    });

    // Verify the field shows current name
    await expect(profileNameInputField).toHaveValue(randomProfileName);

    // Fill with the same value
    await profileNameInputField.fill(randomProfileName);
    await expect(profileNameInputField).toHaveValue(randomProfileName);

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain('New name is the same as the current one.');
      await dialog.accept();
    });

    await page.getByRole('button', { name: '💾 Save Changes' }).click();
    await page.getByRole('button', { name: '🏠 Home' }).click();
    await expect(page).toHaveURL('/dashboard');
    const welcome = page.locator('.welcome-text');
    await expect(welcome).toBeVisible();
    await expect(welcome).toHaveText(`Welcome, ${randomProfileName}!`);

    // check the API result
    const { status: customerProfileStatus, data: customerProfileResponse } =
      await UserSteps.getProfileInfo(token);

    expect(customerProfileStatus).toBe(HttpStatusCode.Ok);
    expect(customerProfileResponse.name).toBe(randomProfileName);
  });
});
