import BasePage from './basePage.js';
import { expect } from 'playwright/test';

export default class UserDashboard extends BasePage {
  get url() {
    return '/dashboard';
  }

  get welcomeText() {
    return this.page.locator('.welcome-text');
  }

  get profileHeaderLink() {
    return this.page.locator('.profile-header');
  }

  get createAccountButton() {
    return this.page.getByText('➕ Create New Account', { exact: true });
  }

  get userDashboardText() {
    return this.page.getByText('User Dashboard', { exact: true });
  }

  async createAccount() {
    await this.createAccountButton.click();
    return this;
  }

  async openProfileHeaderPage() {
    const getProfileResponses = [
      this.page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [200].includes(response.status()),
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [200].includes(response.status()),
      ),
    ];
    await this.profileHeaderLink.click();
    await Promise.all(getProfileResponses);
    await expect(this.page).toHaveURL('/edit-profile');
    return this;
  }

  async expectLoaded() {
    await expect(this.userDashboardText).toBeVisible();
    await expect(this.page).toHaveURL(this.url);
    return this;
  }

  async expectWelcomeTextToContain(name) {
    await expect(this.welcomeText).toBeVisible();
    await expect(this.welcomeText).toHaveText(`Welcome, ${name}!`);
  }
}
