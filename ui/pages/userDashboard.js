import BasePage from './basePage.js';
import { expect } from 'playwright/test';

export default class UserDashboard extends BasePage {
  get url() {
    return '/dashboard';
  }

  get welcomeText() {
    return this.page.locator('.welcome-text');
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

  async expectLoaded() {
    await expect(this.userDashboardText).toBeVisible();
    return this;
  }
}
