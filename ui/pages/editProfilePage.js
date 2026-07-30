import BasePage from './basePage.js';
import { expect } from 'playwright/test';

export default class EditProfile extends BasePage {
  get url() {
    return '/edit-profile';
  }

  get profileHeaderLink() {
    return this.page.locator('.profile-header');
  }

  get saveChangesButton() {
    return this.page.getByRole('button', { name: '💾 Save Changes' });
  }

  get editProfileText() {
    return this.page.getByRole('heading', {
      name: '✏️ Edit Profile',
    });
  }

  get profileNameInputField() {
    return this.page.getByRole('textbox', {
      name: 'Enter new name',
    });
  }
  get homeButton() {
    return this.page.getByRole('button', { name: '🏠 Home' });
  }

  async navigateToUserDashboad() {
    await this.homeButton.click();
  }

  async editProfileName(name) {
    await expect(this.profileNameInputField).toBeVisible();
    await this.profileNameInputField.fill(name);
    await expect(this.profileNameInputField).toHaveValue(name);
    const putProfilePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('profile') &&
        response.request().method() === 'PUT' &&
        [200].includes(response.status()),
    );
    const getProfilePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('profile') &&
        response.request().method() === 'GET' &&
        [200].includes(response.status()),
    );
    await this.saveChangesButton.click();
    await Promise.all([putProfilePromise, getProfilePromise]);
    return this;
  }

  async editProfileNameInvalid(name) {
    await expect(this.profileNameInputField).toBeVisible();
    await this.profileNameInputField.fill(name);
    await expect(this.profileNameInputField).toHaveValue(name);
    await this.saveChangesButton.click({ noWaitAfter: true });
    return this;
  }

  async expectLoaded() {
    await expect(this.editProfileText).toBeVisible();
    await expect(this.editProfileText).toHaveText('✏️ Edit Profile');
    await expect(this.page).toHaveURL(this.url);
    return this;
  }
}
