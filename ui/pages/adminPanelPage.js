import { expect } from 'playwright/test';
import BasePage from './basePage.js';

export default class AdminPanel extends BasePage {
  get url() {
    return '/admin';
  }

  get addUserButton() {
    return this.page.getByText('Add User', { exact: true });
  }
  get adminPanelMessage() {
    return this.page.getByText('AdminPanel', { exact: true });
  }
  get allUsersSections() {
    return this.page.getByText('All Users', { exact: true });
  }

  allUsers() {
    return this.allUsersSections.locator('..').locator('li');
  }

  async createUser(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.addUserButton.click();
    return this;
  }

  async expectAdminPanelVisible() {
    await expect(this.adminPanelMessage).toBeVisible();
    return this;
  }

  async expectUserVisible(username) {
    const liExact = this.allUsers().filter({
      has: this.page.getByText(username, { exact: true }),
    });
    await expect(liExact).toHaveCount(1);
    return this;
  }

  async expectUserNotExists(username) {
    const liExact = this.allUsers().filter({
      has: this.page.getByText(username, { exact: true }),
    });
    await expect(liExact).toHaveCount(0);
    return this;
  }
}
