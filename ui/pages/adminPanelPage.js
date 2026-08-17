import { expect } from 'playwright/test';
import BasePage from './basePage.js';
import UserBadge from './elements/userBadge.js';
import URL from './url.js';

export default class AdminPanel extends BasePage {
  get url() {
    return URL.ADMIN;
  }

  get addUserButton() {
    return this.page.getByText('Add User', { exact: true });
  }
  get adminPanelMessage() {
    return this.page.getByText('Admin Panel', { exact: true });
  }
  get listRoot() {
    return this.page.getByText('All Users', { exact: true }).locator('..');
  }

  get listItems() {
    return this.listRoot.locator('li');
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

  async expectUserVisible(username, timeout = 10_000) {
    const row = this.rowByUsername(username);
    await expect(row).toHaveCount(1, { timeout });
    return this;
  }

  async expectUserNotExists(username, timeout = 10_000) {
    const row = this.rowByUsername(username);
    await expect(row).toHaveCount(0, { timeout });
    return this;
  }

  rowByUsername(username) {
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.listItems.filter({
      hasText: new RegExp(`^${escaped}(USER|ADMIN)?$`),
    });
  }

  async getAllUsers() {
    const count = await this.listItems.count();
    return Array.from(
      { length: count },
      (_, i) => new UserBadge(this.listItems.nth(1)),
    );
  }
}
